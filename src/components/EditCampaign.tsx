import { KeycloakInstance } from "keycloak-js";
import * as React from "react";
import { StoreState, ErrorMessage } from "src/types";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import * as actions from "../actions"
import { Product, CampaignProducts } from "famifarm-typescript-models";
import strings from "src/localization/strings";
import Api from "src/api";
import { Grid, Loader, DropdownItemProps, Button, Form, Select, Input, InputOnChangeData, DropdownProps, List, Message, Confirm } from "semantic-ui-react";
import LocalizedUtils from "src/localization/localizedutils";
import { FormContainer } from "./FormContainer";
import { Redirect } from "react-router";

interface Props {
  keycloak?: KeycloakInstance,
  onError: (error: ErrorMessage) => void,
  campaignId: string
}

interface State {
  products: Product[];
  campaignName: string;
  productId: string;
  count: string;
  addedCampaignProducts: CampaignProducts[];
  loading: boolean;
  redirect: boolean;
  campaignId?: string;
  messageVisible: boolean;
  confirmOpen: boolean;
}

class EditCampaign extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      products: [],
      campaignName: "",
      addedCampaignProducts: [],
      loading: false,
      productId: "",
      count: "1",
      redirect: false,
      messageVisible: false,
      confirmOpen: false
    };
  }

  public async componentDidMount () {
    try {
      await this.initView();
    } catch (exception) {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception
      });
    }
  }

  private initView = async () => {
    if (!this.props.keycloak) {
      return;
    }

    this.setState({ loading: true });
    const productsService = await Api.getProductsService(this.props.keycloak);
    const products = await productsService.listProducts();

    const campaignsService = await Api.getCampaignsService(this.props.keycloak);
    const campaign = await campaignsService.findCampaign(this.props.campaignId);
    const campaignName = campaign.name;
    const addedCampaignProducts = campaign.products;
    this.setState({ products, loading: false, campaignName, addedCampaignProducts, campaignId: campaign.id! });
  }

  public render () {
    if (this.state.redirect) {
      return <Redirect to={`/campaigns`} push={true} />;
    }

    if (this.state.loading) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader inline active size="medium" />
        </Grid>
      );
      }
      
    const productOptions: DropdownItemProps[] = [{ key: "", value: "", text: "", }].concat(this.state.products.map((product) => {
      const id = product.id!;
      const name = LocalizedUtils.getLocalizedValue(product.name);
    
      return {
        key: id,
        value: id,
        text: name
      };
    }));

    const addedCampaignProducts = this.state.addedCampaignProducts.map((campaignProduct, i) => {
      return (
        <List.Item key={ i }>
          <List.Content floated='right'>
            <Button icon="remove" onClick={ () => this.removeAddedCampaignProduct(i) }/>
          </List.Content>
          <List.Content>
          <List.Header>{ `${ productOptions.find(product => product.value === campaignProduct.productId)!.text } x ${ campaignProduct.count }` }</List.Header>
          </List.Content>
        </List.Item>
      );
    });
    
    return (
      <Grid>
      <Grid.Row className="content-page-header-row">
      <Grid.Column width={8}>
        <h2>{ strings.editCampaign }</h2>
      </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column width={8}>
          <FormContainer>    
            <Form.Field>
              <label>{ strings.product }</label>
              <Select options={ productOptions } value={ this.state.productId } onChange={ this.onCampaignProductChange }></Select>
            </Form.Field>
            <Form.Field>
              <label>{ strings.productCount }</label>
              <Input type="number" value={ this.state.count } onChange={ this.onCampaignProductCountChange }></Input>
            </Form.Field>
            <Form.Field>
              <Button className="submit-button" onClick={this.addCampaignProduct}>{ strings.addCampaignProduct }</Button>
            </Form.Field>
            <List>
              { addedCampaignProducts }
            </List>
            <Form.Field required>
              <label>{ strings.campaignName }</label>
              <Input type="text" value={ this.state.campaignName } onChange={ this.onCampaignNameChange }></Input>
            </Form.Field>
            <Message
              success
              visible={this.state.messageVisible}
              header={strings.savedSuccessfully}
            />
            <Button className="submit-button" onClick={this.handleSubmit} type='submit'>{ strings.save }</Button>
            <Button className="danger-button" onClick={() => this.setState({ confirmOpen:true })}>{ strings.delete }</Button>
          </FormContainer>
        </Grid.Column>
      </Grid.Row>
      <Confirm open={ this.state.confirmOpen } size={"mini"} content={strings.deleteConfirmationText + this.state.campaignName } onCancel={ () => this.setState({ confirmOpen:false }) } onConfirm={ this.handleDelete } />
    </Grid>
    );

  }

  /**
   * Changes the campaign name
   * 
   * @param value campaign name
   */
  private onCampaignNameChange = (event: any, { value }: InputOnChangeData) => {
    this.setState({ campaignName: value });
  }

  /**
   * Changes the campaign product
   * 
   * @param event 
   * @param props
   */
  private onCampaignProductChange = (event: any, { value }: DropdownProps) => {
    this.setState({ productId: value as string });
  };

  /**
   * Changes the campaign product count
   * 
   * @param value count
   */
  private onCampaignProductCountChange = (event: any, { value }: InputOnChangeData) => {
    console.log(value);
    this.setState({ count: value });
  }

  /**
   * Adds a campaign product to state
   */
  private addCampaignProduct = () => {
    const { count, productId } = this.state;
    const countNumber = Number.parseInt(count);
    if (productId.length > 0 && !isNaN(countNumber) && countNumber >= 1) {
      const addedCampaignProducts = this.state.addedCampaignProducts;
      const campaignProduct = { count: countNumber, productId };
      addedCampaignProducts.push(campaignProduct);
      this.setState({ count: "1", productId: "", addedCampaignProducts });
    }
  }

  /**
   * Removes a campaign product at a specific index
   * 
   * @param index remove a campaign product at this index
   */
  private removeAddedCampaignProduct = (index: number) => {
    const addedCampaignProducts = this.state.addedCampaignProducts;
    addedCampaignProducts.splice(index, 1);
    this.setState({ addedCampaignProducts });
  }

  /**
   * Handles submitting a new campaign
   */
  private handleSubmit = async () => {
    if (!this.props.keycloak || !this.state.campaignId) {
      return;
    }

    try {
      this.setState({ loading: true });
      const { campaignName, addedCampaignProducts } = this.state;
      const campaignsService = await Api.getCampaignsService(this.props.keycloak);
      await campaignsService.updateCampaign({ id: this.state.campaignId, name: campaignName, products: addedCampaignProducts }, this.state.campaignId);
      this.setState({ messageVisible: true, loading: false });
      setTimeout(() => {
        this.setState({messageVisible: false});
      }, 3000);
    } catch (exception) {
      this.setState({ loading: false });
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception
      });
    }

  }

  private handleDelete = async () => {
    try {
      if (!this.props.keycloak || !this.state.campaignId) {
        throw new Error("Either Keycloak or campaign id is undefined");
      }

      const campaignsService = await Api.getCampaignsService(this.props.keycloak);
      await campaignsService.deleteCampaign(this.state.campaignId);

      this.setState({redirect: true});
    } catch (e) {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
 
  }

}

/**
 * Redux mapper for mapping store state to component props
 * 
 * @param state store state
 */
export function mapStateToProps(state: StoreState) {
  return {
  };
  }
  
  /**
   * Redux mapper for mapping component dispatches 
   * 
   * @param dispatch dispatch method
   */
  export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onError: (error: ErrorMessage) => dispatch(actions.onErrorOccurred(error))
  };
  }
  
  export default connect(mapStateToProps, mapDispatchToProps)(EditCampaign);
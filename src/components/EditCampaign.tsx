import { KeycloakInstance } from "keycloak-js";
import * as React from "react";
import { StoreState, ErrorMessage } from "../types";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import * as actions from "../actions"
import { Product, Facility, CampaignProduct } from "../generated/client";
import strings from "../localization/strings";
import Api from "../api";
import { Grid, Loader, DropdownItemProps, Button, Form, Select, Input, DropdownProps, List, Message, Confirm, InputOnChangeData } from "semantic-ui-react";
import LocalizedUtils from "../localization/localizedutils";
import { FormContainer } from "./FormContainer";
import { Navigate } from "react-router-dom";

interface Props {
  keycloak?: KeycloakInstance,
  onError: (error: ErrorMessage | undefined) => void,
  campaignId: string;
  facility: Facility;
}

interface State {
  products: Product[];
  campaignName: string;
  productId: string;
  count: string;
  addedCampaignProducts: CampaignProduct[];
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
    } catch (exception: any) {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception
      });
    }
  }

  private initView = async () => {
    const { keycloak, campaignId, facility } = this.props;
    if (!keycloak) {
      return;
    }

    this.setState({ loading: true });
    const productsService = await Api.getProductsService(keycloak);
    const products = await productsService.listProducts({
      includeSubcontractorProducts: true,
      includeInActiveProducts: true,
      facility: facility
    });

    const campaignsService = await Api.getCampaignsService(keycloak);
    const campaign = await campaignsService.findCampaign({
      campaignId: campaignId,
      facility: facility
    });
    const campaignName = campaign.name;
    const addedCampaignProducts = campaign.products;
    this.setState({ products, loading: false, campaignName, addedCampaignProducts, campaignId: campaign.id! });
  }

  public render () {
    if (this.state.redirect) {
      return <Navigate replace={true} to={`/campaigns`}/>;
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
      const cProduct = productOptions.find(product => product.value === campaignProduct.productId);
      const title = `${ (cProduct || {}).text } x ${ campaignProduct.count }`
      return (
        <List.Item key={ i }>
          <List.Content floated='right'>
            <Button icon="remove" onClick={ () => this.removeAddedCampaignProduct(i) }/>
          </List.Content>
          <List.Content>
          <List.Header>{ title }</List.Header>
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
              <Select options={ (productOptions || []) } value={ this.state.productId } onChange={ this.onCampaignProductChange }></Select>
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
    const { keycloak, facility } = this.props;
    const { campaignId } = this.state;
    if (!keycloak || !campaignId) {
      return;
    }

    try {
      this.setState({ loading: true });
      const { campaignName, addedCampaignProducts } = this.state;
      const campaignsService = await Api.getCampaignsService(keycloak);
      await campaignsService.updateCampaign({
        campaignId: campaignId,
        facility: facility,
        campaign: {
          id: campaignId,
          name: campaignName,
          products: addedCampaignProducts
        }
      });
      this.setState({ messageVisible: true, loading: false });
      setTimeout(() => {
        this.setState({messageVisible: false});
      }, 3000);
    } catch (exception: any) {
      this.setState({ loading: false });
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception
      });
    }

  }

  private handleDelete = async () => {
    const { keycloak, facility } = this.props;
    const { campaignId } = this.state;
    try {
      if (!keycloak || !campaignId) {
        throw new Error("Either Keycloak or campaign id is undefined");
      }

      const campaignsService = await Api.getCampaignsService(keycloak);
      await campaignsService.deleteCampaign({
        campaignId: campaignId,
        facility: facility
      });

      this.setState({redirect: true});
    } catch (e: any) {
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
    facility: state.facility
  };
}
  
/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onError: (error: ErrorMessage | undefined) => dispatch(actions.onErrorOccurred(error))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(EditCampaign);
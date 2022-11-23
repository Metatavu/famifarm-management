import { KeycloakInstance } from "keycloak-js";
import * as React from "react";
import { StoreState, ErrorMessage } from "../types";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import * as actions from "../actions"
import { Product, CampaignProduct, Facility } from "../generated/client";
import strings from "../localization/strings";
import Api from "../api";
import { Grid, Loader, DropdownItemProps, Button, Form, Select, Input, DropdownProps, List, InputOnChangeData } from "semantic-ui-react";
import LocalizedUtils from "../localization/localizedutils";
import { FormContainer } from "./FormContainer";
import { redirect } from "react-router-dom";

interface Props {
  keycloak?: KeycloakInstance,
  facility: Facility;
  onError: (error: ErrorMessage | undefined) => void
}

interface State {
  products: Product[];
  campaignName: string;
  productId: string;
  count: string;
  addedCampaignProducts: CampaignProduct[];
  loading: boolean;
  redirect: boolean;
  campaignId: string;
}

class CreateCampaign extends React.Component<Props, State> {
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
      campaignId: ""
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
    const { keycloak, facility } = this.props;
    if (!keycloak) {
      return;
    }

    this.setState({ loading: true });
    const productsService = await Api.getProductsService(keycloak);
    const products = await productsService.listProducts({
      includeSubcontractorProducts: true,
      facility: facility
    });
    this.setState({ products, loading: false });
  }

  public render () {
    if (this.state.redirect) {
      redirect(`/campaigns/${this.state.campaignId}`);
      return null;
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
        <h2>{ strings.newCampaign }</h2>
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
            <Button className="submit-button" onClick={this.handleSubmit} type='submit'>{ strings.save }</Button>
          </FormContainer>
        </Grid.Column>
      </Grid.Row>
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
    const { keycloak, onError, facility } = this.props;
    if (!keycloak) {
      return;
    }

    try {
      this.setState({ loading: true });
      const { campaignName, addedCampaignProducts } = this.state;
      const campaignsService = await Api.getCampaignsService(keycloak);
      const createdCampaign = await campaignsService.createCampaign({
        campaign: {
          name: campaignName,
          products: addedCampaignProducts
        },
        facility: facility
      });
      this.setState({ campaignId: createdCampaign.id!, redirect: true });
    } catch (exception: any) {
      this.setState({ loading: false });
      onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception
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

export default connect(mapStateToProps, mapDispatchToProps)(CreateCampaign);
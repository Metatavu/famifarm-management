import { KeycloakInstance } from "keycloak-js";
import * as React from "react";
import { StoreState, ErrorMessage } from "src/types";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import * as actions from "../actions"
import { Product, CampaignProducts } from "famifarm-typescript-models";
import strings from "src/localization/strings";
import Api from "src/api";
import { Grid, Loader, DropdownItemProps, Button, Form, Select, Input } from "semantic-ui-react";
import LocalizedUtils from "src/localization/localizedutils";
import { FormContainer } from "./FormContainer";

interface Props {
  keycloak?: KeycloakInstance,
  onError: (error: ErrorMessage) => void
}

interface State {
  products: Product[];
  campaignName: string;
  productId: string;
  count: number;
  addedCampaignProducts: CampaignProducts[];
  loading: boolean;
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
      count: 1
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
    this.setState({ products, loading: false });
  }

  public render () {
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
            <Form.Field required>
                <label>{ strings.campaignName }</label>
                <Input type="text" value={ this.state.campaignName} onChange={ this.onCampaignNameChange }></Input>
            </Form.Field>
            <Button className="submit-button" onClick={this.handleSubmit} type='submit'>{strings.save}</Button>
          </FormContainer>
        </Grid.Column>
      </Grid.Row>
    </Grid>
    );

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
  
  export default connect(mapStateToProps, mapDispatchToProps)(CreateCampaign);
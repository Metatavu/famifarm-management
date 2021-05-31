import * as React from "react";
import * as actions from "../actions"
import { connect } from "react-redux";
import { ErrorMessage, PackageSizeOptions, StoreState } from "src/types";
import { Dispatch } from "redux";
import strings from "src/localization/strings";
import { Grid, Form, Button, Select, DropdownProps, Input, InputOnChangeData, Loader } from "semantic-ui-react";
import { DateInput } from 'semantic-ui-calendar-react';
import { FormContainer } from "./FormContainer";
import { Packing, Product, PackageSize, PackingState, PackingType, Campaign, StorageDiscard } from "../generated/client";
import LocalizedUtils from "src/localization/localizedutils";
import * as moment from "moment";
import Api from "../api";
import { Redirect } from "react-router";

/**
 * Interface representing component properties
 */
export interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  onPackingCreated?: (packing: Packing) => void;
  onError: (error: ErrorMessage) => void;
}

/**
 * Interface representing component state
 */
export interface State {
  productId?: string;
  packingStatus?: PackingState;
  packageSizeId?: string;
  discardCount: number;
  products: Product[];
  loading: boolean;
  packageSizes: PackageSize[];
  date: Date;
  redirect: boolean;
  discardId?: string;
  selectedProduct?: Product;
}

/**
 * React component for creating new discard
 */
class CreateDiscard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      products: [],
      packageSizes: [],
      loading: false,
      discardCount: 0,
      date: moment().toDate(),
      redirect: false,
    }
  }

  /**
   * Component did mount life cycle method
   */
  public async componentDidMount() {
    try {
      await this.fetchData();
    } catch (e) {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
  }

  /**
   * render
   */
  render = () => {
    const {
      loading,
      redirect,
      discardCount,
      productId,
      packageSizeId,
      date,
      products
    } = this.state;

    if (loading) {
      return (
        <Grid style={{ paddingTop: "100px" }} centered>
        <Loader inline active size="medium" />
        </Grid>
      );
    }
      
    if (redirect) {
      return <Redirect to={ `/discards/${this.state.discardId}` } push />;
    }

    const productOptions = products.map(({ id, name }) => ({
      key: id!,
      value: id!,
      text: LocalizedUtils.getLocalizedValue(name)
    }));

    const filteredPackageSizeOptions = this.filterOptions();

    return (    
      <Grid>
        <Grid.Row className="content-page-header-row">
          <Grid.Column width={8}>
            <h2>{ strings.newDiscard }</h2>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
            <FormContainer>
              <Form.Field required>
                <label>{ strings.product }</label>
                <Select
                  options={ productOptions }
                  value={ productId }
                  onChange={ this.onDiscardedProductChange }
                />
              </Form.Field>
              <Form.Field required>
                <label>{ strings.packageSize }</label>
                { filteredPackageSizeOptions &&
                  <Select
                    options={ filteredPackageSizeOptions }
                    value={ packageSizeId }
                    onChange={ this.onDiscardedSizeChange }
                  />
                } 
              </Form.Field>
              <Form.Field>
                <label>{ strings.labelPackedCount }</label>
                <Input
                  type="number"
                  value={ discardCount }
                  onChange={ this.onDiscardedCountChange }
                />
              </Form.Field>
              <Form.Field>
                <DateInput
                  dateFormat="DD.MM.YYYY"
                  onChange={ this.onChangeDate }
                  name="date"
                  value={ moment(date).format("DD.MM.YYYY") }
                />
              </Form.Field>
              <Button
                className="submit-button"
                onClick={ this.handleSubmit }
                type='submit'
              >
                { strings.save }
              </Button>
            </FormContainer>            
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }

  /**
   * Event handler for discarded product change
   *
   * @param event React change event
   * @param data dropdown properties
   */
  private onDiscardedProductChange = (event: React.SyntheticEvent<HTMLElement>, data: DropdownProps) => {
    const { products } = this.state;
    const selectedProduct = products.find(p => p.id === data.value);

    this.setState({
      productId: data.value as string,
      selectedProduct
    });
  }

  /**
   * Event handler for discarded product change
   *
   * @param event React change event
   * @param data dropdown properties
   */
  private onDiscardedSizeChange = (event: React.SyntheticEvent<HTMLElement>, data: DropdownProps) => {
    this.setState({ packageSizeId: data.value as string });
  }

  /**
   * Event handler for discarded count change
   *
   * @param event React change event
   * @param data input change data
   */
  private onDiscardedCountChange = (event: any, { value }: InputOnChangeData) => {
    const { discardCount } = this.state;
    const count = Number(value);
    !Number.isNaN(discardCount) && this.setState({
      discardCount: count > 0 ? count : 0
    });
  }


  /**
   * Handles changing date
   *
   * @param event React change event
   * @param data input change data
   */
  private onChangeDate = async (event: any, { value }: InputOnChangeData) => {
    this.setState({ date: moment(value, "DD.MM.YYYY HH:mm").toDate() });
  }

  /**
   * Handle form submit
   */
  private handleSubmit = async () => {
    const { packageSizeId, discardCount } = this.state;
    const { keycloak } = this.props;
    if (!keycloak) {
      return;
    }

    try {

      const storageDiscard: StorageDiscard = {

      }

      const storageDiscardService = await Api.getStorageDiscardsService(keycloak);
      const discarded = await storageDiscardService.createStorageDiscard({
        storageDiscard: {
          productId: this.state.productId,
          discardDate: new Date(),
          packageSizeId: packageSizeId,
          discardAmount: discardCount,
        }
      });
      this.setState({
        discardId: discarded.id,
        redirect: true
      });
    } catch (e) {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
  }

  /**
   * method for filtering options based on selected product
   *
   * @returns filtered options
   */
  private filterOptions = () => {
    const { selectedProduct, packageSizes } = this.state;

    const newOptions: PackageSizeOptions[] = [];
    packageSizes.forEach(size => {
      if(!selectedProduct || !selectedProduct.defaultPackageSizeIds) return;
      selectedProduct.defaultPackageSizeIds.forEach(packageSizeId =>
        size.id === packageSizeId && newOptions.push({ 
          key: size.id,
          value: size.id,
          text: LocalizedUtils.getLocalizedValue(size.name)
        })
      );
    });

    return newOptions;
  }

  /**
   * method for fetching data
   */
  private fetchData = async () => {
    const { keycloak } = this.props;
    if (!keycloak) {
      return;
    }

    this.setState({ loading: true });
  
    const productsService = await Api.getProductsService(keycloak);
    const packageSizeService = await Api.getPackageSizesService(keycloak);

    const products = await productsService.listProducts({});
    const packageSizes = await packageSizeService.listPackageSizes({});
      
    this.setState({
      products,
      packageSizes,
      productId: products.length ? products[0].id! : "",
      selectedProduct: products.length ? products[0]: undefined,
      loading: false
    });
  }
}

/**
 * Redux mapper for mapping store state to component props
 * 
 * @param state store state
 */
const mapStateToProps = (state: StoreState) => ({ });
  
/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
const mapDispatchToProps = (dispatch: Dispatch<actions.AppAction>) => ({
  onError: (error: ErrorMessage) => dispatch(actions.onErrorOccurred(error))
});
  
export default connect(mapStateToProps, mapDispatchToProps)(CreateDiscard);

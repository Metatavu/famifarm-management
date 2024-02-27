import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { StoreState, ErrorMessage } from "../types";
import * as actions from "../actions";
import { Product, PackageSize, StorageDiscard, Facility } from "../generated/client";
import Api from "../api";
import { KeycloakInstance } from "keycloak-js";
import strings from "../localization/strings";
import LocalizedUtils from "../localization/localizedutils";
import { Grid, Button, Form, Select, Input, DropdownProps, Loader, Message, Confirm, InputOnChangeData } from "semantic-ui-react";
import { FormContainer } from "./FormContainer";
import { DateInput } from "semantic-ui-calendar-react";
import moment from "moment";
import { Navigate } from "react-router-dom";

/**
 * Interface representing component properties
 */
export interface Props {
  keycloak: KeycloakInstance,
  onError: (error: ErrorMessage | undefined) => void;
  discardId: string;
  facility: Facility;
}

/**
 * Interface representing component state
 */
export interface State {
  products: Product[],
  discard?: StorageDiscard;
  productName: string;
  date: Date,
  messageVisible: boolean;
  confirmOpen: boolean;
  redirect: boolean;
  discardCount: number;
  loading: boolean;
  packageSizes: PackageSize[];
  productId: string;
  product?: Product;
  packageSizeId?: string,
}

/**
 * React component for editing discarded product
 */
class EditDiscard extends React.Component<Props, State> {
  constructor(props:Props) {
    super(props);
    this.state = {
      products: [],
      productName: "",
      date : new Date(),
      messageVisible: false,
      confirmOpen: false,
      redirect: false,
      packageSizes: [],
      discardCount: 0,
      loading: false,
      productId: "",
    }
  }

  /**
   * Component did mount life cycle method
   */
  public async componentDidMount() {
    try {
      await this.fetchData();
    } catch (e: any) {
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
  render = () =>  {
    const {
      loading,
      products,
      packageSizes,
      productId,
      packageSizeId,
      discardCount,
      date,
      messageVisible,
      } = this.state;

    if (loading) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader inline active size="medium" />
        </Grid>
      );
    }

    if (this.state.redirect) {
      return <Navigate replace={true} to="/discards"/>;
    }

    const productOptions = products.map(({ id, name }) => ({
      key: id!,
      value: id!,
      text: LocalizedUtils.getLocalizedValue(name)
    }));

    const packageSizeOptions = packageSizes.map(({ id, name }) => ({
      key: id!,
      value: id!,
      text: LocalizedUtils.getLocalizedValue(name)
    }));

    return (
      <Grid>
        <Grid.Row className="content-page-header-row">
          <Grid.Column width={ 8 }>
              <h2>{strings.editDiscard}</h2>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={ 8 }>
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
                <Select
                  options={ packageSizeOptions }
                  value={ packageSizeId }
                  onChange={ this.onDiscardedSizeChange }
                />
              </Form.Field>
              <Form.Field required>
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
                  localization="fi-FI"
                  dateFormat="DD.MM.YYYY"
                  onChange={ this.onChangeDate }
                  name="date"
                  value={ moment(date).format("DD.MM.YYYY") }
                />
              </Form.Field>
              <Message
                success
                visible={ messageVisible }
                header={ strings.savedSuccessfully }
              />
              <Button
                className="submit-button"
                onClick={ this.handleSubmit }
                type='submit'
              >
                { strings.save }
              </Button>
              <Button
                className="danger-button"
                onClick={ () => this.setState({ confirmOpen: true }) }
              >
                { strings.delete }
              </Button>
            </FormContainer>
          </Grid.Column>
        </Grid.Row>
        <Confirm
          open={ this.state.confirmOpen }
          size="mini"
          content={ this.getDeleteConfirmationText() }
          onCancel={ () => this.setState({ confirmOpen : false }) }
          onConfirm={ this.handleDelete }
        />
      </Grid>
    )
  }

  /**
   * Returns a delete confirmation text
   */
  private getDeleteConfirmationText = (): string => {
    const { discard } = this.state;
    if (discard) {
      const productText = this.getProductName(discard)
      return strings.deleteConfirmationText + productText + "?";
    }

      return strings.deleteConfirmationText + "?";
    }

  /**
   * Returns a discarded products name
   *
   * @param discardedProduct discarded product
   */
    private getProductName = (discardedProduct: StorageDiscard): string => {
      const { products } = this.state;
      const discard = (products || []).find(product => product.id == discardedProduct.productId);

      const productName = discard ? LocalizedUtils.getLocalizedValue(discard.name) : "";

      return productName;
    }


  /**
   * method for fetching data from api
   */
  private fetchData =  async () => {
    const { keycloak, discardId, facility } = this.props;

    if(!keycloak) {
      return;
    }

    this.setState({ loading: true })

    const productsService = await Api.getProductsService(keycloak);
    const products = await productsService.listProducts({
      includeSubcontractorProducts: true,
      facility: facility
    });

    const discardsService = await Api.getStorageDiscardsService(keycloak);
    const discard = await discardsService.getStorageDiscard({
      storageDiscardId: discardId,
      facility: facility
    })

    const packageSizesSerivce = await Api.getPackageSizesService(keycloak);
    const packageSizes = await packageSizesSerivce.listPackageSizes({ facility: facility });

    const product = (products || []).find(product => product.id == discard.productId);
    const date = discard.discardDate || new Date();
    const discardCount = discard.discardAmount || 0;
    const packageSizeId = discard.packageSizeId;
    const productId = discard.productId;

    if(!productId || !product) {
      throw new Error("Product id undefined");
    }

    const productName = LocalizedUtils.getLocalizedValue(product.name);

    this.setState({
      products,
      discard,
      packageSizes,
      productName,
      date,
      discardCount,
      packageSizeId,
      loading: false,
      productId
    })
  }

  /**
   * Submits an updated discard
   */
    private  handleSubmit = async () => {
      const { discard, productId, date, discardCount, packageSizeId } = this.state;
      const { keycloak, facility, onError } = this.props;

      try {
        const updatedDiscard = {
          id: discard ? discard.id : undefined,
          productId: productId,
          discardDate: date,
          discardAmount: discardCount,
          packageSizeId: packageSizeId,
        }

        if (!updatedDiscard.id) {
          throw new Error("Discard id is undefined.");
        }

        const discardService = await Api.getStorageDiscardsService(keycloak);
        await discardService.updateStorageDiscard({
          storageDiscardId: updatedDiscard.id,
          storageDiscard: updatedDiscard,
          facility: facility
        });

        this.setState({ messageVisible: true });
        setTimeout(() => {
          this.setState({ messageVisible: false });
        }, 3000);
      } catch (e: any) {
        onError({
          message: strings.defaultApiErrorMessage,
          title: strings.defaultApiErrorTitle,
          exception: e
        });
      }
    }

  /**
   * Deletes a discard
   */
  private handleDelete = async () => {
    const { discard } = this.state;
    const { keycloak, facility, onError } = this.props;

    try {
      const discardService = await Api.getStorageDiscardsService(keycloak);
      if (!discard) {
        throw new Error("Discard is undefined");
      }

      if (!discard.id) {
        throw new Error("Discard id is undefined")
      }

      await discardService.deleteStorageDiscard({
        storageDiscardId: discard.id,
        facility: facility
      })

      this.setState({ redirect: true });

    } catch (e: any) {
      onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
  }


  /**
   * Event handler for discarded product change
   *
   * @param event React change event
   * @param data dropdown properties
   */
    private onDiscardedProductChange = (event: React.SyntheticEvent<HTMLElement>, data: DropdownProps) => {
      this.setState({ productId: data.value as string });
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
      const { discardCount } = this.state;
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
    private onChangeDate = (e: any, { value }: DropdownProps) => {
      this.setState({date: moment(value as any, "DD.MM.YYYY HH:mm").toDate()});
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
};

/**
 * Redux mapper for mapping component dispatches
 *
 * @param dispatch dispatch method
 */
export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
     onError: (error: ErrorMessage | undefined) => dispatch(actions.onErrorOccurred(error))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EditDiscard)

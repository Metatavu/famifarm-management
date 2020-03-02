import * as React from "react";
import * as actions from "../actions"
import { connect } from "react-redux";
import { ErrorMessage, StoreState } from "src/types";
import { Dispatch } from "redux";
import strings from "src/localization/strings";
import { Grid, Form, Button, Select, DropdownItemProps, DropdownProps, Input, InputOnChangeData, Loader } from "semantic-ui-react";
import { DateInput } from 'semantic-ui-calendar-react';
import { FormContainer } from "./FormContainer";
import { Packing, Product, PackageSize, PackingState } from "famifarm-typescript-models";
import LocalizedUtils from "src/localization/localizedutils";
import * as moment from "moment";
import Api from "../api";
import { Redirect } from "react-router";

export interface Props {
    keycloak?: Keycloak.KeycloakInstance;
    onPackingCreated?: (packing: Packing) => void,
    onError: (error: ErrorMessage) => void
}

export interface State {
    productId?: string,
    packingStatus?: PackingState,
    packageSizeId?: string,
    packedCount: number,
    products: Product[],
    loading: boolean,
    packageSizes: PackageSize[],
    date: string,
    redirect: boolean,
    packingId?: string
}

class CreatePacking extends React.Component<Props, State> {
    constructor(props:Props) {
        super(props);
        this.state = {
            products: [],
            packageSizes: [],
            loading: false,
            packedCount: 0,
            date: moment(moment(), "YYYY.MM.DD HH:mm").toISOString(),
            redirect: false
        }

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    public async componentDidMount() {
        try {
            if (!this.props.keycloak) {
              return;
            }
        
            this.setState({loading: true});
      
            const productsService = await Api.getProductsService(this.props.keycloak);
            const products = await productsService.listProducts();

            const packageSizeService = await Api.getPackageSizesService(this.props.keycloak);
            const packageSizes = await packageSizeService.listPackageSizes();
            
            this.setState({
              productId: products.length ? products[0].id! : "",
              packageSizes: packageSizes, 
              products: products,
              loading: false
            });
      
          } catch (e) {
            this.props.onError({
              message: strings.defaultApiErrorMessage,
              title: strings.defaultApiErrorTitle,
              exception: e
            });
          }
    }

    render() {
        if (this.state.loading) {
            return (
              <Grid style={{paddingTop: "100px"}} centered>
                <Loader inline active size="medium" />
              </Grid>
            );
          }
          
          if (this.state.redirect) {
            return <Redirect to={`/packings/${this.state.packingId}`} push={true} />;
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

          const packageSizeOptions: DropdownItemProps[] = [{ key: "", value: "", text: "", }].concat(this.state.packageSizes.map((size) => {
            const id = size.id!;
            const name = LocalizedUtils.getLocalizedValue(size.name);
      
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
                    <h2>{strings.newPacking}</h2>
                </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column width={8}>
                        <FormContainer>
                            <Form.Field required>
                                <label>{strings.product}</label>
                                <Select options={ productOptions } value={ this.state.productId } onChange={ this.onPackingProductChange }></Select>
                            </Form.Field>
                            <Form.Field required>
                                <label>{strings.packageSize}</label>
                                <Select options={ packageSizeOptions } value={ this.state.packageSizeId } onChange={ this.onPackageSizeChange }></Select>
                            </Form.Field>
                            <Form.Field required>
                                <label>{strings.packingStatus}</label>
                                <Select options={ [{value:"IN_STORE", text: strings.packingStoreStatus}, {value: "REMOVED", text: strings.packingRemovedStatus}] } text={this.state.packingStatus ? this.resolveStatusLocalizedName() : strings.selectPackingStatus} value={ this.state.packingStatus } onChange={ this.onStatusChange }></Select>
                            </Form.Field>
                            <Form.Field required>
                                <label>{strings.labelPackedCount}</label>
                                <Input type="number" value={ this.state.packedCount} onChange={ this.onPackedCountChange }></Input>
                            </Form.Field>
                            <Form.Field>
                                <DateInput dateFormat="DD.MM.YYYY" onChange={this.onChangeDate} name="date" value={ moment(this.state.date).format("DD.MM.YYYY") } />
                            </Form.Field>
                            <Button className="submit-button" onClick={this.handleSubmit} type='submit'>{strings.save}</Button>
                        </FormContainer>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        )
    }

    /**
     * Resolves localized name of the packing status
     */
    private resolveStatusLocalizedName = () => {
        return this.state.packingStatus === "IN_STORE" ? strings.packingStoreStatus : strings.packingRemovedStatus;
    }

    /**
     * Event handler for product change 
     */
    private onPackingProductChange = (event: React.SyntheticEvent<HTMLElement>, data: DropdownProps) => {
        this.setState({
        productId: data.value as string
        });
    }

    /**
     * Event handler for product change 
     */
    private onPackageSizeChange = (event: React.SyntheticEvent<HTMLElement>, data: DropdownProps) => {
        this.setState({
        packageSizeId: data.value as string
        });
    }

    /**
     * Event handler for packed count change 
     */
    private onPackedCountChange = (event: any, { value }: InputOnChangeData) => {
        const actualNumber = Number.parseInt(value) >= 0 ? Number.parseInt(value) : 0;
        this.setState({packedCount: actualNumber})
    }
    
    /**
     * Event handler for packing status
     */
    private onStatusChange = (event: any, { value }: InputOnChangeData) => {
        this.setState({packingStatus: value as PackingState})
    }
    
    /**
     * Handles changing date
     */
    private onChangeDate = async (e: any, { value }: InputOnChangeData) => {
        this.setState({date: moment(value, "YYYY.MM.DD HH:mm").toISOString()});
    }
    /**
     * Handle form submit
     */
    private async handleSubmit() {
        try {
            if (!this.props.keycloak) {
                return;
            }

            const packingObject: Packing= {
                state: this.state.packingStatus as PackingState,
                productId: this.state.productId || "",
                time: this.state.date,
                packageSizeId: this.state.packageSizeId,
                packedCount: this.state.packedCount
            };

            const packingsService = await Api.getPackingsService(this.props.keycloak);
            const packing = await packingsService.createPacking(packingObject);
            this.setState({
                packingId: packing.id,
                redirect: true
            })
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
  
  export default connect(mapStateToProps, mapDispatchToProps)(CreatePacking);
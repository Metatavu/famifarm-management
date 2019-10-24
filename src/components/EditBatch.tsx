import * as React from "react";
import * as Keycloak from 'keycloak-js';
import * as actions from "../actions";
import { ErrorMessage, StoreState } from "../types";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import Api from "../api";
import { Batch, BatchPhase, Product } from "famifarm-typescript-models";
import { Redirect } from 'react-router';
import strings from "src/localization/strings";
import { Grid, Button, Form, Select, DropdownItemProps, DropdownProps, Loader } from "semantic-ui-react";
import LocalizedUtils from "src/localization/localizedutils";
import { FormContainer } from "./FormContainer";

export interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  batchId: string,
  onError: (error: ErrorMessage) => void
}

export interface State {
  batch?: Batch,
  phase: BatchPhase,
  productId: string,
  redirect: boolean,
  loading: boolean,
  products: Product[]
}

const PHASES: BatchPhase[] = ["SOWING", "PLANTING", "TABLE_SPREAD", "HARVEST", "PACKING", "COMPLETE"];

class EditBatch extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      productId: "",
      phase: "SOWING",
      redirect: false,
      products: []
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  /**
   * Component did mount life-sycle method
   */
  public async componentDidMount() {
    try {
      if (!this.props.keycloak) {
        return;
      }
  
      this.setState({loading: true});

      const productsService = await Api.getProductsService(this.props.keycloak);
      const batchesService = await Api.getBatchesService(this.props.keycloak);
      
      const products = await productsService.listProducts();
      const batch = await batchesService.findBatch(this.props.batchId);

      if (!batch) {
        throw new Error("Could not find batch");
      }
      
      this.setState({
        phase: batch.phase || "SOWING",
        productId: batch.productId, 
        products: products,
        batch: batch,
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

  /**
   * Handle form submit
   */
  public render() {
    if (this.state.loading) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader inline active size="medium" />
        </Grid>
      );
    }
    
    if (this.state.redirect) {
      return <Redirect to={`/batches/${this.props.batchId}`} push={true} />;
    }

    const batchPhaseOptions: DropdownItemProps[] = PHASES.map((phase) => {
      return {
        key: phase,
        value: phase,
        text: strings[`batchPhase${phase}`]
      };
    });
    
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
            <h2>{strings.editBatch}</h2>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
            <FormContainer>
              <Form.Field required>
                <label>{strings.batchPhase}</label>
                <Select options={ batchPhaseOptions } value={ this.state.phase } onChange={ this.onBatchPhaseChange }/>
              </Form.Field>
              <Form.Field required>
                <label>{strings.batchProduct}</label>
                <Select options={ productOptions } value={ this.state.productId || "" } onChange={ this.onBatchProductChange }/>
              </Form.Field>
              <Button className="submit-button" onClick={this.handleSubmit} type='submit'>{strings.save}</Button>
              <Button onClick={() => this.setState({redirect: true})}>
                {strings.goBack}
              </Button>
            </FormContainer>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }

  /**
   * Handle form submit
   */
  private async handleSubmit() {
    try {
      if (!this.props.keycloak) {
        return;
      }
  
      const batchObject: Batch = {
        phase: this.state.phase,
        productId: this.state.productId
      };
  
      const batchesService = await Api.getBatchesService(this.props.keycloak);
      await batchesService.updateBatch(batchObject, this.props.batchId);

      this.setState({
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
   * Event handler for phase change 
   */
  private onBatchPhaseChange = (event: React.SyntheticEvent<HTMLElement>, data: DropdownProps) => {
    this.setState({
      phase: data.value as BatchPhase
    });
  }

  /**
   * Event handler for product change 
   */
  private onBatchProductChange = (event: React.SyntheticEvent<HTMLElement>, data: DropdownProps) => {
    this.setState({
      productId: data.value as string
    });
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

export default connect(mapStateToProps, mapDispatchToProps)(EditBatch);
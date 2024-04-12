import * as React from "react";
import Keycloak from 'keycloak-js';
import * as actions from "../actions";
import { ErrorMessage, StoreState } from "../types";
import { connect } from "react-redux";
import { Dispatch } from "redux";import Api from "../api";
import { Facility, ProductionLine } from "../generated/client";
import { Navigate } from 'react-router-dom';
import strings from "../localization/strings";

import {
  Grid,
  Button,
  Loader,
  Form,
  Input,
  Message,
  Confirm
} from "semantic-ui-react";
import { FormContainer } from "./FormContainer";

/**
 * Interface representing component properties
 */
interface Props {
  keycloak?: Keycloak;
  productionLineId: string;
  productionLine?: ProductionLine;
  facility: Facility;
  onProductionLineSelected?: (productionLine: ProductionLine) => void;
  onProductionLineDeleted?: (productionLineId: string) => void;
  onError: (error: ErrorMessage | undefined) => void;
}

/**
 * Interface representing component state
 */
interface State {
  productionLine?: ProductionLine;
  redirect: boolean;
  saving: boolean;
  messageVisible: boolean;
  open:boolean;
}

/**
 * React component for edit production line view
 */
class EditProductionLine extends React.Component<Props, State> {

  /**
   * Constructor 
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      productionLine: undefined,
      redirect: false,
      saving: false,
      messageVisible: false,
      open:false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handeLineNumberChange = this.handeLineNumberChange.bind(this);
    this.handeDefaultGutterHoleCountChange = this.handeDefaultGutterHoleCountChange.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  /**
   * Component did mount life-sycle method
   */
  public async componentDidMount() {
    const { keycloak, facility, productionLineId, onError, onProductionLineSelected } = this.props;
    try {
      if (!keycloak) {
        return;
      }
  
      const productionLineService = await Api.getProductionLinesService(keycloak);
      const productionLine = await productionLineService.findProductionLine({
        productionLineId: productionLineId,
        facility: facility
      });
  
      onProductionLineSelected && onProductionLineSelected(productionLine);
      this.setState({productionLine: productionLine});
    } catch (e: any) {
      onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
  }

  /**
   * Handle line number change
   * 
   * @param event event
   */
  private handeLineNumberChange(event: React.FormEvent<HTMLInputElement>) {
    this.setState({productionLine: { ...this.state.productionLine, lineNumber: event.currentTarget.value }});
  }

  /**
   * Handle line number change
   * 
   * @param event event
   */
  private handeDefaultGutterHoleCountChange(event: React.FormEvent<HTMLInputElement>) {
    this.setState({productionLine: { ...this.state.productionLine, defaultGutterHoleCount: parseInt(event.currentTarget.value) || undefined }});
  }

  /**
   * Handle form submit
   */
  private async handleSubmit() {
    const { keycloak, facility, onError } = this.props;
    const { productionLine } = this.state;
    try {
      if (!keycloak || !productionLine) {
        return;
      }
  
      const productionLineService = await Api.getProductionLinesService(keycloak);
  
      this.setState({saving: true});
      await productionLineService.updateProductionLine({
        productionLineId: productionLine.id!,
        productionLine: productionLine,
        facility: facility
      });
      this.setState({saving: false});
  
      this.setState({messageVisible: true});
      setTimeout(() => {
        this.setState({messageVisible: false});
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
   * Handle productionLine delete
   */
  private async handleDelete() {
    const { keycloak, facility, onError, onProductionLineDeleted } = this.props;
    const { productionLine } = this.state;
    try {
      if (!keycloak || !productionLine) {
        return;
      }
  
      const productionLineService = await Api.getProductionLinesService(keycloak);
      const id = productionLine.id || "";
  
      await productionLineService.deleteProductionLine({
        productionLineId: id,
        facility: facility
      });
      
      onProductionLineDeleted && onProductionLineDeleted(id);
      this.setState({redirect: true});
    } catch (e: any) {
      onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
  }

  /**
   * Render edit productionLine view
   */
  public render() {
    if (!this.props.productionLine) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader inline active size="medium" />
        </Grid>
      );
    }

    if (this.state.redirect) {
      return <Navigate replace={true} to="/productionLines"/>;
    }

    return (
      <Grid>
        <Grid.Row className="content-page-header-row">
          <Grid.Column width={6}>
            <h2>{this.props.productionLine!.lineNumber}</h2>
          </Grid.Column>
          <Grid.Column width={3} floated="right">
            <Button className="danger-button" onClick={()=>this.setState({open:true})}>{strings.delete}</Button>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
            <FormContainer>
              <Form.Field required>
                <label>{strings.productionLineNumber}</label>
                <Input 
                  value={this.state.productionLine && this.state.productionLine.lineNumber} 
                  placeholder={strings.productionLineNumber}
                  onChange={this.handeLineNumberChange}
                />
              </Form.Field>
              <Form.Field>
                <label>{strings.productionLineDefaultGutterHoleCount}</label>
                <Input 
                  value={this.state.productionLine && this.state.productionLine.defaultGutterHoleCount} 
                  placeholder={strings.productionLineDefaultGutterHoleCount}
                  onChange={this.handeDefaultGutterHoleCountChange}
                />
              </Form.Field>
              <Message
                success
                visible={this.state.messageVisible}
                header={strings.savedSuccessfully}
              />
              <Button 
                className="submit-button" 
                onClick={this.handleSubmit} 
                type='submit'
                loading={this.state.saving}
              >
                  {strings.save}
              </Button>
            </FormContainer>
          </Grid.Column>
        </Grid.Row>
        <Confirm open={this.state.open} size={"mini"} content={strings.deleteConfirmationText+strings.productionLineNumber+" "+this.props.productionLine!.lineNumber} onCancel={()=>this.setState({open:false})} onConfirm={this.handleDelete} />
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
    productionLines: state.productionLines,
    productionLine: state.productionLine,
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
    onProductionLineSelected: (productionLine: ProductionLine) => dispatch(actions.productionLineSelected(productionLine)),
    onProductionLineDeleted: (productionLineId: string) => dispatch(actions.productionLineDeleted(productionLineId)),
    onError: (error: ErrorMessage | undefined) => dispatch(actions.onErrorOccurred(error))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(EditProductionLine);
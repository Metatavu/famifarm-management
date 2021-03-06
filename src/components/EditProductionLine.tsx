import * as React from "react";
import * as Keycloak from 'keycloak-js';
import * as actions from "../actions";
import { ErrorMessage, StoreState } from "../types";
import { connect } from "react-redux";
import { Dispatch } from "redux";import Api from "../api";
import { ProductionLine } from "../generated/client";
import { Redirect } from 'react-router';
import strings from "src/localization/strings";

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
  keycloak?: Keycloak.KeycloakInstance;
  productionLineId: string;
  productionLine?: ProductionLine;
  onProductionLineSelected?: (productionLine: ProductionLine) => void;
  onProductionLineDeleted?: (productionLineId: string) => void,
  onError: (error: ErrorMessage) => void
}

/**
 * Interface representing component state
 */
interface State {
  productionLine?: ProductionLine;
  redirect: boolean;
  saving: boolean;
  messageVisible: boolean;
  open:boolean
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
    try {
      if (!this.props.keycloak) {
        return;
      }
  
      const productionLineService = await Api.getProductionLinesService(this.props.keycloak);
      const productionLine = await productionLineService.findProductionLine({productionLineId: this.props.productionLineId});
  
      this.props.onProductionLineSelected && this.props.onProductionLineSelected(productionLine);
      this.setState({productionLine: productionLine});
    } catch (e) {
      this.props.onError({
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
    this.setState({productionLine: { ... this.state.productionLine, lineNumber: event.currentTarget.value }});
  }

  /**
   * Handle line number change
   * 
   * @param event event
   */
  private handeDefaultGutterHoleCountChange(event: React.FormEvent<HTMLInputElement>) {
    this.setState({productionLine: { ... this.state.productionLine, defaultGutterHoleCount: parseInt(event.currentTarget.value) || undefined }});
  }

  /**
   * Handle form submit
   */
  private async handleSubmit() {
    try {
      if (!this.props.keycloak || !this.state.productionLine) {
        return;
      }
  
      const productionLineService = await Api.getProductionLinesService(this.props.keycloak);
  
      this.setState({saving: true});
      await productionLineService.updateProductionLine({productionLineId: this.state.productionLine.id!, productionLine: this.state.productionLine});
      this.setState({saving: false});
  
      this.setState({messageVisible: true});
      setTimeout(() => {
        this.setState({messageVisible: false});
      }, 3000);
    } catch (e) {
      this.props.onError({
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
    try {
      if (!this.props.keycloak || !this.state.productionLine) {
        return;
      }
  
      const productionLineService = await Api.getProductionLinesService(this.props.keycloak);
      const id = this.state.productionLine.id || "";
  
      await productionLineService.deleteProductionLine({productionLineId: id});
      
      this.props.onProductionLineDeleted && this.props.onProductionLineDeleted(id);
      this.setState({redirect: true});
    } catch (e) {
      this.props.onError({
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
      return <Redirect to="/productionLines" push={true} />;
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
    productionLine: state.productionLine
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
    onError: (error: ErrorMessage) => dispatch(actions.onErrorOccurred(error))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(EditProductionLine);
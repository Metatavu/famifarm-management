import * as React from "react";
import * as Keycloak from 'keycloak-js';
import * as actions from "../actions";
import { ErrorMessage, StoreState } from "../types";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import Api from "../api";
import { ProductionLine } from "famifarm-typescript-models";
import { Redirect } from 'react-router';

import {
  Grid,
  Button,
  Form,
  Input
} from "semantic-ui-react";
import strings from "src/localization/strings";
import { FormContainer } from "./FormContainer";

interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  productionLine?: ProductionLine;
  onProductionLineCreated?: (productionLine: ProductionLine) => void,
  onError: (error: ErrorMessage) => void
}

interface State {
  lineNumber: string
  defaultGutterHoleCount?: number
  redirect: boolean
}

class CreateProductionLine extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
        lineNumber: "",
        redirect: false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  /**
   * Handle line number change
   * 
   * @param event event
   */
  private handeDefaultGutterHoleCountChange = (event: React.FormEvent<HTMLInputElement>) => {
    this.setState({defaultGutterHoleCount: parseInt(event.currentTarget.value) || undefined });
  }

  /**
   * Handle form submit
   */
  private async handleSubmit() {
    try {
      if (!this.props.keycloak) {
        return;
      }
      
      const productionLineObject = {
        lineNumber: this.state.lineNumber,
        defaultGutterHoleCount: this.state.defaultGutterHoleCount
      };
  
      const productionLineService = await Api.getProductionLinesService(this.props.keycloak);
      await productionLineService.createProductionLine(productionLineObject);
  
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
   * Render create production line view
   */
  public render() {
    if (this.state.redirect) {
      return <Redirect to="/productionLines" push={true} />;
    }

    return (
      <Grid>
        <Grid.Row className="content-page-header-row">
          <Grid.Column width={8}>
            <h2>{strings.newProductionLine}</h2>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
            <FormContainer>
              <Form.Field required>
                <label>{strings.productionLineNumber}</label>
                <Input 
                  value={this.state.lineNumber} 
                  placeholder={strings.productionLineNumber}
                  onChange={(e) => this.setState({lineNumber: e.currentTarget.value})}
                />
              </Form.Field>
              <Form.Field>
                <label>{strings.productionLineDefaultGutterHoleCount}</label>
                <Input 
                  value={this.state.defaultGutterHoleCount} 
                  placeholder={strings.productionLineDefaultGutterHoleCount}
                  onChange={this.handeDefaultGutterHoleCountChange}
                />
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
    onProductionLineCreated: (productionLine: ProductionLine) => dispatch(actions.productionLineCreated(productionLine)),
    onError: (error: ErrorMessage) => dispatch(actions.onErrorOccurred(error))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateProductionLine);
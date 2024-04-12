import * as React from "react";
import Keycloak from 'keycloak-js';
import * as actions from "../actions";
import { ErrorMessage, StoreState } from "../types";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import Api from "../api";
import { Facility, ProductionLine } from "../generated/client";
import { Navigate } from 'react-router-dom';

import {
  Grid,
  Button,
  Form,
  Input
} from "semantic-ui-react";
import strings from "../localization/strings";
import { FormContainer } from "./FormContainer";

interface Props {
  keycloak?: Keycloak;
  productionLine?: ProductionLine;
  facility: Facility;
  onProductionLineCreated?: (productionLine: ProductionLine) => void,
  onError: (error: ErrorMessage | undefined) => void;
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
    const { keycloak, facility, onError } = this.props;
    const { lineNumber, defaultGutterHoleCount } = this.state;
    try {
      if (!keycloak) {
        return;
      }
      
      const productionLineObject = {
        lineNumber: lineNumber,
        defaultGutterHoleCount: defaultGutterHoleCount
      };
  
      const productionLineService = await Api.getProductionLinesService(keycloak);
      await productionLineService.createProductionLine({
        productionLine: productionLineObject,
        facility: facility
      });
  
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
   * Render create production line view
   */
  public render() {
    if (this.state.redirect) {
      return <Navigate replace={true} to="/productionLines"/>;
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
    onProductionLineCreated: (productionLine: ProductionLine) => dispatch(actions.productionLineCreated(productionLine)),
     onError: (error: ErrorMessage | undefined) => dispatch(actions.onErrorOccurred(error))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateProductionLine);
import * as React from "react";
import Keycloak from 'keycloak-js';
import * as actions from "../actions";
import { ErrorMessage, StoreState } from "../types";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import Api from "../api";
import { NavLink } from 'react-router-dom';
import { Facility, ProductionLine } from "../generated/client";
import strings from "../localization/strings";

import {
  List,
  Button,
  Grid,
  Loader
} from "semantic-ui-react";

export interface Props {
  keycloak?: Keycloak;
  productionLines?: ProductionLine[];
  facility: Facility;
  onProductionLinesFound?: (productionLines: ProductionLine[]) => void,
  onError: (error: ErrorMessage | undefined) => void
}

export interface State {
  productionLines: ProductionLine[];
}

class ProductionLineList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      productionLines: []
    };
  }

  /**
   * Component did mount life-sycle event
   */
  public async componentDidMount() {
    const { keycloak, facility, onError, onProductionLinesFound } = this.props;
    try {
      if (!keycloak) {
        return;
      }
  
      const productionLinesService = await Api.getProductionLinesService(keycloak);
      const productionLines = await productionLinesService.listProductionLines({ facility: facility });

      productionLines.sort((a, b) => {
        let nameA = this.getStringsNumber(a.lineNumber)
        let nameB = this.getStringsNumber(b.lineNumber)
        if(nameA < nameB) { return -1; }
        if(nameA > nameB) { return 1; }
        return 0;
      });
      onProductionLinesFound && onProductionLinesFound(productionLines);
    } catch (e: any) {
      onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
  }

  /**
   * Get containing numbers in string
   * 
   * @param string string
   * @returns Number
   */
  private getStringsNumber = (string ?: string) : Number => {
    return string && string.match(/\d+/g) ? Number(string.match(/\d+/g)) : 0;
  }

  /**
   * Render production line list view
   */
  public render() {

    const { productionLines } = this.props;

    if (!productionLines) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader inline active size="medium" />
        </Grid>
      );
    }

    const productionLineElements = productionLines.sort(this.compareProductionLines).map((productionLine, i) => {
      const productionLinePath = `/productionLines/${productionLine.id}`;
      return (
        <List.Item style={i % 2 == 0 ? {backgroundColor: "#ddd"} : {}} key={productionLine.id}>
          <List.Content floated='right'>
            <NavLink to={productionLinePath}>
              <Button className="submit-button">{strings.open}</Button>
            </NavLink>
          </List.Content>
          <List.Content>
            <List.Header style={{paddingTop: "10px"}}>{productionLine.lineNumber}</List.Header>
          </List.Content>
        </List.Item>
      );
    });

    return (
      <Grid>
        <Grid.Row className="content-page-header-row" style={{flex: 1,justifyContent: "space-between", paddingLeft: 10, paddingRight: 10}}>
          <h2>{strings.productionLines}</h2>
          <NavLink to="/createProductionLine">
            <Button className="submit-button">{strings.newProductionLine}</Button>
          </NavLink>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <List divided animated verticalAlign='middle'>
              {productionLineElements}
            </List>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }

  /**
   * Compares production lines by line number ignoring letters 
   * 
   * @param productionLine1 Production line to compare
   * @param productionLine2 Production line  to compare
   */
  private compareProductionLines(productionLine1: ProductionLine, productionLine2: ProductionLine) {
    const lineNumber1 = productionLine1.lineNumber;
    const lineNumber2 = productionLine2.lineNumber;

    const lineValue1 = lineNumber1 ? Number(lineNumber1.replace(/\D/g, "")) : Number.MAX_SAFE_INTEGER;
    const lineValue2 = lineNumber2 ? Number(lineNumber2.replace(/\D/g, "")) : Number.MAX_SAFE_INTEGER;
    return lineValue1 - lineValue2;
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
    onProductionLinesFound: (productionLines: ProductionLine[]) => dispatch(actions.productionLinesFound(productionLines)),
     onError: (error: ErrorMessage | undefined) => dispatch(actions.onErrorOccurred(error))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductionLineList);
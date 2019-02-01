import * as React from "react";
import * as Keycloak from 'keycloak-js';
import FamiFarmApiClient from '../api-client';
import { ProductionLine } from 'famifarm-client';
import { Redirect } from 'react-router';

import {
  Grid,
  Button,
  Form,
  Input
} from "semantic-ui-react";

interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  productionLine?: ProductionLine;
  onProductionLineCreated?: (productionLine: ProductionLine) => void;
}

interface State {
  lineNumber: string;
  redirect: boolean;
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
   * Handle form submit
   */
  handleSubmit() {
    const lineNumber = parseInt(this.state.lineNumber)

    if (isNaN(lineNumber)) {
      alert("Tuotantolinjan numero ei saa olla muu kuin numero");
      return;
    }
    
    const productionLineObject = {
      lineNumber: lineNumber
    };
    new FamiFarmApiClient().createProductionLine(this.props.keycloak!, productionLineObject).then(() => {
      this.setState({redirect: true});
    });
  }

  render() {
    if (this.state.redirect) {
      return <Redirect to="/productionLines" push={true} />;
    }

    return (
      <Grid>
        <Grid.Row className="content-page-header-row">
          <Grid.Column width={8}>
            <h2>Uusi tuotantolinja</h2>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
            <Form>
              <Form.Field required>
                <label>Tuontantolinjan numero</label>
                <Input 
                  value={this.state.lineNumber} 
                  placeholder='Numero' 
                  onChange={(e) => this.setState({lineNumber: e.currentTarget.value})}
                />
              </Form.Field>
              <Button className="submit-button" onClick={this.handleSubmit} type='submit'>Tallenna</Button>
            </Form>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default CreateProductionLine;
import * as React from "react";
import * as Keycloak from 'keycloak-js';
import FamiFarmApiClient from '../api-client';
import { ProductionLine } from 'famifarm-client';
import { Redirect } from 'react-router';
import strings from "src/localization/strings";

import {
  Grid,
  Button,
  Loader,
  Form,
  Input,
  Message
} from "semantic-ui-react";

export interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  productionLineId: string;
  productionLine?: ProductionLine;
  onProductionLineSelected?: (productionLine: ProductionLine) => void;
  onProductionLineDeleted?: (productionLineId: string) => void;
}

export interface State {
  productionLine?: ProductionLine;
  redirect: boolean;
  saving: boolean;
  messageVisible: boolean;
}

class EditProductionLine extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
        productionLine: undefined,
        redirect: false,
        saving: false,
        messageVisible: false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handeLineNumberChange = this.handeLineNumberChange.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  /**
   * Component did mount life-sycle method
   */
  componentDidMount() {
    new FamiFarmApiClient().findProductionLine(this.props.keycloak!, this.props.productionLineId).then((productionLine) => {
      this.props.onProductionLineSelected && this.props.onProductionLineSelected(productionLine);
      this.setState({productionLine: productionLine});
    });
  }

  /**
   * Handle line number change
   * 
   * @param event event
   */
  handeLineNumberChange(event: React.FormEvent<HTMLInputElement>) {
    const lineNumber = parseInt(event.currentTarget.value);

    if (isNaN(lineNumber)) {
      alert(strings.productionLineNotNumber);
      return;
    }

    const productionLine = {
      id: this.state.productionLine!.id,
      lineNumber: lineNumber
    };

    this.setState({productionLine: productionLine});
  }

  /**
   * Handle form submit
   */
  async handleSubmit() {
    this.setState({saving: true});
    await new FamiFarmApiClient().updateProductionLine(this.props.keycloak!, this.state.productionLine!);
    this.setState({saving: false});

    this.setState({messageVisible: true});
    setTimeout(() => {
      this.setState({messageVisible: false});
    }, 3000);
  }

  /**
   * Handle productionLine delete
   */
  handleDelete() {
    const id = this.state.productionLine!.id;

    new FamiFarmApiClient().deleteProductionLine(this.props.keycloak!, id!).then(() => {
      this.props.onProductionLineDeleted && this.props.onProductionLineDeleted(id!);
      this.setState({redirect: true});
    });
  }

  /**
   * Render edit productionLine view
   */
  render() {
    if (!this.props.productionLine) {
      return (
        <Grid style={{paddingTop: "100px"}} centered className="pieru">
          <Loader active size="medium" />
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
            <Button className="danger-button" onClick={this.handleDelete}>{strings.delete}</Button>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
          <Form>
          <Form.Field required>
            <label>{strings.productionLineNumber}</label>
            <Input 
              value={this.state.productionLine && this.state.productionLine!.lineNumber} 
              placeholder={strings.productionLineNumber}
              onChange={this.handeLineNumberChange}
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
          </Form>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default EditProductionLine;
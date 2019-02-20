import * as React from "react";
import * as Keycloak from 'keycloak-js';
import Api from "../api";
import { ProductionLine } from "famifarm-typescript-models";
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

/**
 * Interface representing component properties
 */
interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  productionLineId: string;
  productionLine?: ProductionLine;
  onProductionLineSelected?: (productionLine: ProductionLine) => void;
  onProductionLineDeleted?: (productionLineId: string) => void;
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
    this.handleDelete = this.handleDelete.bind(this);
  }

  /**
   * Component did mount life-sycle method
   */
  public async componentDidMount() {
    if (!this.props.keycloak) {
      return;
    }

    const productionLineService = await Api.getProductionLinesService(this.props.keycloak);

    productionLineService.findProductionLine(this.props.productionLineId).then((productionLine) => {
      this.props.onProductionLineSelected && this.props.onProductionLineSelected(productionLine);
      this.setState({productionLine: productionLine});
    });
  }

  /**
   * Handle line number change
   * 
   * @param event event
   */
  private handeLineNumberChange(event: React.FormEvent<HTMLInputElement>) {
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
  private async handleSubmit() {
    if (!this.props.keycloak || !this.state.productionLine) {
      return;
    }

    const productionLineService = await Api.getProductionLinesService(this.props.keycloak);

    this.setState({saving: true});
    productionLineService.updateProductionLine(this.state.productionLine, this.state.productionLine.id || "");
    this.setState({saving: false});

    this.setState({messageVisible: true});
    setTimeout(() => {
      this.setState({messageVisible: false});
    }, 3000);
  }

  /**
   * Handle productionLine delete
   */
  private async handleDelete() {
    if (!this.props.keycloak || !this.state.productionLine) {
      return;
    }

    const productionLineService = await Api.getProductionLinesService(this.props.keycloak);
    const id = this.state.productionLine.id || "";

    productionLineService.deleteProductionLine(id).then(() => {
      this.props.onProductionLineDeleted && this.props.onProductionLineDeleted(id);
      this.setState({redirect: true});
    });
  }

  /**
   * Render edit productionLine view
   */
  public render() {
    if (!this.props.productionLine) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
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
            <Button className="danger-button" onClick={()=>this.setState({open:true})}>{strings.delete}</Button>
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
        <Confirm open={this.state.open} size={"mini"} content={strings.deleteConfirmationText+strings.productionLineNumber+" "+this.props.productionLine!.lineNumber} onCancel={()=>this.setState({open:false})} onConfirm={this.handleDelete} />
      </Grid>
    );
  }
}

export default EditProductionLine;
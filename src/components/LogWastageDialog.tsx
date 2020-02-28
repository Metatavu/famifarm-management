import * as React from "react";
import * as Keycloak from 'keycloak-js';
import Api from "../api";
import { Event, EventType, WastageEventData, ProductionLine, WastageReason } from "famifarm-typescript-models";
import strings from "src/localization/strings";
import { DateTimeInput } from 'semantic-ui-calendar-react';
import * as actions from "../actions";
import { StoreState } from "../types/index";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import {
  Button,
  Form,
  Message,
  InputOnChangeData,
  TextAreaProps,
  Modal,
  Segment
} from "semantic-ui-react";
import LocalizedUtils from "src/localization/localizedutils";
import * as moment from "moment";
import { ErrorMessage } from "src/types";
import { FormContainer } from "./FormContainer";

/**
 * Interface representing component properties
 */
interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  startTime: string,
  endTime: string,
  batchId: string,
  productionLineId?: string,
  loss: number,
  phase: EventType,
  open: boolean,
  onClose?: () => void
  onSuccess?: (event: Event) => void
  onError: (error: ErrorMessage) => void
}

/**
 * Interface representing component state
 */
interface State {
  loading: boolean
  saving: boolean
  messageVisible: boolean,
  event?: Event
  productionLines?: ProductionLine[]
  wastageReasons?: WastageReason[]
}

/**
 * React component for edit event view
 */
class LogWastageDialog extends React.Component<Props, State> {

  /**
   * Constructor
   * 
   * @param props component props
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      saving: false,
      messageVisible: false,
    };
  }

  /**
   * Component did mount life-sycle method
   */
  public componentDidMount = () => {
    this.setState({
      event: {
        batchId: this.props.batchId,
        startTime: this.props.startTime,
        endTime: this.props.endTime,
        data: {
          reasonId: "",
          amount: this.props.loss,
          phase: this.props.phase,
          productionLineId: this.props.productionLineId
        },
        type: "WASTAGE"
      }
    });
    this.loadWastageData().catch((e) => {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    });
  }

  /**
   * Render edit product view
   */
  public render() {
    if (!this.state.event) {
      return null;
    }
    const event: Event = this.state.event;
    const data = event.data as WastageEventData;

    const wastageReasonOptions = (this.state.wastageReasons || []).map((wastageReason) => {
      return {
        key: wastageReason.id,
        value: wastageReason.id,
        text: LocalizedUtils.getLocalizedValue(wastageReason.reason)
      };
    });

    const productionLineOptions = (this.state.productionLines || []).map((productionLine) => {
      return {
        key: productionLine.id,
        value: productionLine.id,
        text: productionLine.lineNumber
      };
    });

    const phaseOptions = ['PLANTING', 'SOWING', 'TABLE_SPREAD', 'CULTIVATION_OBSERVATION', 'HARVEST' ].map((phase) => {
      return {
        key: phase,
        value: phase,
        text: strings.getString(`phase${phase}`, strings.getLanguage())
      };
    })

    return (
      <Modal open={this.props.open} onClose={() => this.props.onClose && this.props.onClose()}>
        <Modal.Header>{strings.logPhaseWastageHeader}</Modal.Header>
        <Modal.Content>
          {this.state.loading ? (
            <Segment style={{height: "500px"}} loading></Segment>
          ) : (
            <FormContainer>
              <Form.Field required>
                <label>{strings.labelStartTime}</label>
                <DateTimeInput dateTimeFormat="YYYY.MM.DD HH:mm" onChange={this.handleTimeChange} name="startTime" value={moment(event.startTime).format("YYYY.MM.DD HH:mm")} />
              </Form.Field>
              <Form.Field>
                <label>{strings.labelEndTime}</label>
                <DateTimeInput dateTimeFormat="YYYY.MM.DD HH:mm" onChange={this.handleTimeChange} name="endTime" value={moment(event.endTime).format("YYYY.MM.DD HH:mm")} />
              </Form.Field>
              <Form.Select required label={strings.labelWastageReason} name="reasonId" options={wastageReasonOptions} value={data.reasonId} onChange={this.handleDataChange} />
              <Form.Select label={strings.labelProductionLine} name="productionLineId" options={productionLineOptions} value={data.productionLineId} onChange={this.handleDataChange} />
              <Form.Select label={strings.labelPhase} name="phase" options={phaseOptions} value={data.phase} onChange={this.handleDataChange} />
              <Form.Input required label={strings.labelAmount} name="amount" type="number" value={data.amount} onChange={this.handleDataChange} />
              <Form.TextArea label={strings.labelAdditionalInformation} onChange={this.handleBaseChange} name="additionalInformation" value={event.additionalInformation} />
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
          )}
        </Modal.Content>
      </Modal>
    );
  }

    /**
   * Handle value change
   * 
   * @param event event
   */
  private handleTimeChange = (e: any, { name, value }: InputOnChangeData | TextAreaProps) => {
    const eventData = this.state.event;
    if (!eventData) {
      return;
    }

    eventData[name] = moment(value, "YYYY.MM.DD HH:mm").toISOString();
    this.setState({ event: eventData });
  }

  /**
   * Handle value change
   * 
   * @param event event
   */
  private handleBaseChange = (e: any, { name, value }: InputOnChangeData | TextAreaProps) => {
    const eventData = this.state.event;
    if (!eventData) {
      return;
    }

    eventData[name] = value;
    this.setState({ event: eventData });
  }

  /**
   * Handle value change
   * 
   * @param event event
   */
  private handleDataChange = (e: any, { name, value }: InputOnChangeData | TextAreaProps) => {
    const eventData = this.state.event;
    if (!eventData) {
      return;
    }

    eventData.data[name] = value;
    this.setState({ event: eventData });
  }

  /**
   * Handle form submit
   */
  private handleSubmit = async () => {
    const { event } = this.state;
    try {
      if (!this.props.keycloak || !event) {
        return;
      }

      this.setState({saving: true});
      const eventsService = await Api.getEventsService(this.props.keycloak);
      event.type = "WASTAGE";
      const createdEvent = await eventsService.createEvent(event);
      this.setState({saving: false, messageVisible: true});
      setTimeout(() => {
        this.setState({messageVisible: false});
        this.props.onSuccess && this.props.onSuccess(createdEvent);
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
   * Loads data required for wastage event
   */
  private loadWastageData = async () => {
    if (!this.props.keycloak) {
      return;
    }

    this.setState({loading: true});
    const [wastageReasonsService, productionLinesService] = await Promise.all([
      Api.getWastageReasonsService(this.props.keycloak),
      Api.getProductionLinesService(this.props.keycloak)
    ]);

    const [wastageReasons, productionLines] = await Promise.all([
      wastageReasonsService.listWastageReasons(),
      productionLinesService.listProductionLines()
    ]);

    this.setState({
      loading: false,
      wastageReasons: wastageReasons,
      productionLines: productionLines
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

export default connect(mapStateToProps, mapDispatchToProps)(LogWastageDialog);
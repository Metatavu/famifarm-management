import * as React from "react";
import * as Keycloak from 'keycloak-js';
import Api from "../api";
import strings from "src/localization/strings";
import { DateInput } from 'semantic-ui-calendar-react';

import {
  Grid,
  Button,
  Form,
  InputOnChangeData,
} from "semantic-ui-react";
import * as moment from "moment";

/**
 * Component props
 */
interface Props {
  keycloak?: Keycloak.KeycloakInstance;
}

/**
 * Component state
 */
interface State {
  startTime: string
  endTime: string
  reportType: string
  loading: boolean
}

/**
 * Component for downloading reports
 */
class ReportDownload extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      reportType: "",
      loading: false
    };
  }

  /**
   * Render create pest view
   */
  public render() {
    const reportTypeOptions = [ 
      "WASTAGE",
      "GROWTH_TIME",
      "YIELD",
      "PLANTING_YIELD",
      "SOWED",
      "PLANTED",
      "SPREAD",
      "HARVESTED",
      "PACKED",
      "PRODUCT_PHASE_COUNT"
    ].map((reportType) => {
      return {
        key: reportType,
        value: reportType,
        text: strings.getString(`reportTypeItem${reportType}`, strings.getLanguage())
      };
    });
    
    return (
      <Grid>
        <Grid.Row className="content-page-header-row">
          <Grid.Column width={8}>
            <h2>{strings.reportDownloadHeader}</h2>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
            <Form>
              <Form.Select onChange={this.updateReportType} value={this.state.reportType} label={strings.reportTypeLabel} options={reportTypeOptions} placeholder={strings.reportTypePlaceholder} />
              <Form.Field>
                <label>{strings.labelStartTime}</label>
                <DateInput dateFormat="DD.MM.YYYY" onChange={this.updateStartTime} name="startTime" value={moment(this.state.startTime).format("DD.MM.YYYY")} />
              </Form.Field>
              <Form.Field>
                <label>{strings.labelEndTime}</label>
                <DateInput dateFormat="DD.MM.YYYY" onChange={this.updateEndTime} name="endTime" value={moment(this.state.endTime).format("DD.MM.YYYY")} />
              </Form.Field>
              <Button loading={this.state.loading} className="submit-button" onClick={this.handleSubmit} type='submit'>{strings.save}</Button>
            </Form>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }


  /**
   * Handle form submit
   */
  private handleSubmit = async () => {
    if (!this.props.keycloak) {
      return;
    }

    this.setState({loading: true});
    const fromTime = moment(this.state.startTime).startOf("day").toISOString();
    const toTime = moment(this.state.endTime).endOf("day").toISOString();
    const reportsService = await Api.getReportsService(this.props.keycloak);
    const reportData = await reportsService.getReport(this.state.reportType, fromTime, toTime);
    const dataObj = window.URL.createObjectURL(reportData);
    const link = document.createElement('a');
    document.body.appendChild(link);
    link.href = dataObj;
    link.download=`${this.state.reportType}.xlsx`;
    link.click();
    this.setState({loading: false})
    setTimeout(() => {
      window.URL.revokeObjectURL(dataObj);
    }, 100);
  }

  /**
   * Updates report type
   */
  private updateReportType = (e: any, { value }: InputOnChangeData) => {
    this.setState({
      reportType: value
    });
  }

  /**
   * Updates start time to state
   */
  private updateStartTime =  (e: any, { value }: InputOnChangeData) => {
    this.setState({
      startTime: moment(value, "DD.MM.YYYY").toISOString()
    });
  }

  /**
   * Updates end time to state
   */
  private updateEndTime =  (e: any, { value }: InputOnChangeData) => {
    this.setState({
      endTime: moment(value, "DD.MM.YYYY").toISOString()
    });
  }
}

export default ReportDownload;
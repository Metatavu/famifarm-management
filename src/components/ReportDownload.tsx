import * as React from "react";
import Keycloak from 'keycloak-js';
import Api from "../api";
import strings from "../localization/strings";
import * as actions from "../actions";
import { DateInput } from 'semantic-ui-calendar-react';

import {
  Grid,
  Button,
  Form,
  DropdownProps,
} from "semantic-ui-react";
import moment from "moment";
import { connect } from "react-redux";
import { Facility, SeedBatch } from "../generated/client";
import { StoreState, ErrorMessage } from "../types";

/**
 * Component props
 */
interface Props {
  keycloak?: Keycloak;
  facility: Facility;
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
      "PACKED_CAMPAINGS",
      "PRODUCT_PHASE_COUNT",
      "SEEDLING_TIME",
      "SUMMARY",
      "JUVA_PLANTING_LIST_REPORT",
      "JUVA_HARVEST_LIST_REPORT",
      "JUVA_PACKING_LIST_REPORT",
      "JUVA_SOWING_SUMMARY_REPORT",
      "JUVA_PLANTING_SUMMARY_REPORT",
      "JUVA_PACKING_SUMMARY_REPORT",
      "JUVA_HARVEST_SUMMARY_REPORT",
      "JUVA_YIELD_SUMMARY_REPORT",
      "JUVA_SOWING_WORK_HOURS_REPORT",
      "JUVA_PLANTING_WORK_HOURS_REPORT",
      "JUVA_PACKING_WORK_HOURS_REPORT",
      "JUVA_HARVEST_WORK_HOURS_REPORT",
      "JUVA_PLANTING_WORK_HOUR_SUMMARY_REPORT",
      "JUVA_SOWING_WORK_HOUR_SUMMARY_REPORT",
      "JUVA_HARVEST_WORK_HOUR_SUMMARY_REPORT",
      "JUVA_PACKING_WORK_HOUR_SUMMARY_REPORT"
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
                <DateInput localization="fi-FI" dateFormat="DD.MM.YYYY" onChange={this.updateStartTime} name="startTime" value={moment(this.state.startTime).format("DD.MM.YYYY")} />
              </Form.Field>
              <Form.Field>
                <label>{strings.labelEndTime}</label>
                <DateInput localization="fi-FI" dateFormat="DD.MM.YYYY" onChange={this.updateEndTime} name="endTime" value={moment(this.state.endTime).format("DD.MM.YYYY")} />
              </Form.Field>
              <Button loading={this.state.loading} className="submit-button" onClick={this.handleSubmit} type='submit'>{strings.print}</Button>
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
    const { keycloak, facility } = this.props;
    if (!keycloak) {
      return;
    }

    this.setState({loading: true});
    const fromTime = moment(this.state.startTime).startOf("day").toISOString();
    const toTime = moment(this.state.endTime).endOf("day").toISOString();
    const reportsService = await Api.getReportsService(keycloak);
    const reportData = await reportsService.getReport({
      type: this.state.reportType,
      fromTime, toTime,
      facility: facility
    });

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
  private updateReportType = (e: any, { value }: DropdownProps) => {
    this.setState({
      reportType: value as string
    });
  }

  /**
   * Updates start time to state
   */
  private updateStartTime =  (e: any, { value }: DropdownProps) => {
    this.setState({
      startTime: moment(value as any, "DD.MM.YYYY").toISOString()
    });
  }

  /**
   * Updates end time to state
   */
  private updateEndTime =  (e: any, { value }: DropdownProps) => {
    this.setState({
      endTime: moment(value as any, "DD.MM.YYYY").toISOString()
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
    facility: state.facility
  };
}

/**
 * Redux mapper for mapping component dispatches
 *
 * @param dispatch dispatch method
 */
export function mapDispatchToProps(dispatch: React.Dispatch<actions.AppAction>) {
  return {
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ReportDownload);
import * as React from "react";
import * as Keycloak from 'keycloak-js';
import Api from "../api";
import { Campaign, PackageSize, Packing, Product } from "../generated/client";
import strings from "../localization/strings";
import moment from "moment";
import * as actions from "../actions";
import { StoreState, ErrorMessage, VisualizePackingsData } from "../types/index";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import {
  Grid,
  Loader,
  Form,
  DropdownProps,
  Header
} from "semantic-ui-react";
import { DateInput } from 'semantic-ui-calendar-react';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

/**
 * Interface representing component properties
 */
interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  packings?: Packing[];
  products?: Product[];
  packageSizes?: PackageSize[];
  campaigns?: Campaign[];
  onPackingsFound?: (packings: Packing[]) => void;
  onError: (error: ErrorMessage | undefined) => void;
};

/**
 * Interface representing component state
 */
interface State {
  packings?: Packing[];
  loading: boolean;
  selectedDate: string;
};

/**
 * React component for displaying list of packings
 */
class Dashboard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      selectedDate: moment().toISOString()
    };
  };

  /**
   * Component did mount life cycle event
   */
  public async componentDidMount() {
    try {
      await this.updatePackings(this.state.selectedDate, false);
    } catch (e: any) {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
  };

  /**
   * Handles changing date
   *
   * @param e event
   * @param value value from DropdownProps
   */
  private onChangeDateAfter = async (e: any, { value }: DropdownProps) => {
    const selectedDate = moment(value as any, "DD.MM.YYYY").toISOString()
    this.setState({ selectedDate: selectedDate });
    await this.updatePackings(selectedDate, false).catch(err => {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: err
      });
    });
  };

  /**
   * Updates packings
   *
   * @param filters filters
   * @param append boolean
   */
  private updatePackings = async (selectedDate: string, append: boolean) => {
    const { keycloak, onPackingsFound } = this.props;
    if (!keycloak) {
      return;
    }

    this.setState({ loading: true });
    const packingsService = await Api.getPackingsService(keycloak);
    const selectedMoment = moment(selectedDate);
    const packings  = await packingsService.listPackings({
      createdAfter: selectedMoment.startOf("day").toISOString(),
      createdBefore: selectedMoment.endOf("day").toISOString()
    });
    onPackingsFound && onPackingsFound(append ? (this.props.packings || []).concat(packings) : packings);
    this.setState({ selectedDate: selectedDate, loading: false });
  };

  /**
   * Render packing list view
   */
  public render() {
    const { packings } = this.props;
    const { selectedDate } = this.state;

    const possibleLoader = (): any => {
      if (this.state.loading) {
        return <Loader 
          style={{ marginLeft: "auto", marginRight: "auto" }}
          inline
          active
          size="medium" />
      }
    }

    const renderForm = () => {
      const filterStyles: React.CSSProperties = {
        display:"inline-block",
        paddingTop: "1rem",
        paddingBottom: "1rem",
        paddingRight: "2rem"
      };
      const headerStyles: React.CSSProperties = {
        paddingTop: "1rem",
      };

      return (
        <Form>
          <Form.Field>
            <Header style={ headerStyles }>Select date to display cumulative packings data for:</Header>
            <div style={ filterStyles }>
              <label>{ strings.selectDate }</label>
              <DateInput
                  dateFormat="DD.MM.YYYY"
                  onChange={ this.onChangeDateAfter }
                  name="selectedDate"
                  value={ selectedDate ? moment(selectedDate).format("DD.MM.YYYY") : "" }
                />
            </div>
          </Form.Field>
        </Form>
      );
    };

    const renderLineChart = () => {
      if (!packings?.length) {
        return;
      }

      const packingsData: VisualizePackingsData[] = packings?.map(packing => (
        {
          time: packing.time,
          count: packing.packedCount,
          labelDate: moment(packing.time).format("L"),
          labelTime: moment(packing.time).format("LT")
        }
      ));

      packingsData.sort((a, b) => moment(a.time).toDate().getTime() - moment(b.time).toDate().getTime());

      const isMoreThanOneDay = packingsData?.some(packing => {
        return moment(packing.time).format("L") > moment(packingsData[0].time).format("L");
      });

      /**
       * Accumulate the counts for packings data
       * 
       * @param packingsData packings data to visualize
       * @param isMoreThanOneDay
       * @returns packings data with cumulative counts
       */
      const cumulativeCounts = (packingsData: VisualizePackingsData[], isMoreThanOneDay: boolean) => {
        if (!isMoreThanOneDay) {
          packingsData.reduce((acc, packing, i) => {
            if (!packing.count) {
              return acc;
            } else {
              packingsData[i] = { ...packingsData[i], count: acc + packing.count };
              return acc + packing.count;
            }
          }, 0);
        }
        return packingsData;
      };

      /**
       * Format tick label depending on time range of data being visualized
       * 
       * @param value tick label
       * @param isMoreThanOneDay 
       * @returns formatted tick label depending on time range
       */
      const formatTicks = (value: any, isMoreThanOneDay: boolean) => {
        return isMoreThanOneDay ? moment(value).format("L") : moment(value).format("LT");
      };

      /**
       * Format tooltips label depending on time range of data being visualized
       * 
       * @param value tooltips label
       * @param isMoreThanOneDay 
       * @returns formatted tooltips label depending on time range
       */
      const formatTooltips = (value: any, isMoreThanOneDay: boolean) => {
        return isMoreThanOneDay ? moment(value).format("L") : moment(value).format("LTS");
      };
      
      return (  
        <>
          <LineChart
            width={1000}
            height={500}
            data={cumulativeCounts(packingsData, isMoreThanOneDay)}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time"
              tickFormatter={ (value) => formatTicks(value, isMoreThanOneDay) }
              interval="preserveStartEnd"
              padding={{ left: 100, right: 100 }}
            />
            <YAxis />
            <Tooltip
              labelFormatter={ (value) => formatTooltips(value, isMoreThanOneDay) }
            />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#82ca9d" />
          </LineChart>
        </>
      );
    };

    return (
      <Grid>
        <Grid.Row
          className="content-page-header-row"
          style={{ flex: 1,justifyContent: "space-between", paddingLeft: 10, paddingRight: 10 }}
        >
          <h2>{ strings.dashboard }</h2>
        </Grid.Row>
        <Grid.Row>
        <Grid.Row>
          { renderForm() }
        </Grid.Row>
          { renderLineChart() }
        </Grid.Row>
        <Grid.Row>
        </Grid.Row>
        { possibleLoader() }
      </Grid>
    );
  };
};

/**
 * Redux mapper for mapping store state to component props
 * 
 * @param state store state
 */
const mapStateToProps = (state: StoreState) => ({
  packings: state.packings,
});

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
const mapDispatchToProps = (dispatch: Dispatch<actions.AppAction>) => ({
  onPackingsFound: (packings: Packing[]) => dispatch(actions.packingsFound(packings)),
  onError: (error: ErrorMessage | undefined) => dispatch(actions.onErrorOccurred(error)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
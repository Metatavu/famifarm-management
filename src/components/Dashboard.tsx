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
import { X_AXIS_TIMES } from "../constants";

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
 * React component for displaying packings visualization
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
    const packings = await packingsService.listPackings({
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
        display: "inline-block",
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
            <Header style={headerStyles}>{strings.dashboardFormDescription}</Header>
            <div style={filterStyles}>
              <label>{strings.selectDate}</label>
              <DateInput
                dateFormat="DD.MM.YYYY"
                onChange={this.onChangeDateAfter}
                name="selectedDate"
                value={selectedDate ? moment(selectedDate).format("DD.MM.YYYY") : ""}
              />
            </div>
          </Form.Field>
        </Form>
      );
    };

    /**
     * Render visualizaton of packings data
     * 
     * @returns recharts visualization
     */
    const renderLineChart = () => {
      if (!packings?.length) {
        return;
      }

      const packingsData: VisualizePackingsData[] = packings?.map(packing => (
        {
          time: packing.time.valueOf(),
          count: packing.packedCount
        }
      ));

      /**
       * Get timestamps for a particular hour on the same day as the provided time
       * 
       * @param time timestamp on a given day
       * @param hour hour of timestamp to return
       * @returns timestamp
       */
      const setTimestamps = (time: number, hour: number) =>  {
        return moment(time).set("hour", hour).set("minutes", 0).valueOf();
      };

      /**
       * Create a placeholder data to contain the x-axis static label
       * 
       * @param staticHours 
       * @returns List of VisualizePackingsData
       */
      const createLabelPackings = (staticHours: number[]): VisualizePackingsData[] => (
        staticHours.map(hour => ({
          label: hour,
          time: hour,
          count: 0
        }))
      );

      /**
       * Get the timestamps for label times on a given day 
       * 
       * @param time timestamp
       * @param packingsData
       * @returns static times timestamps
       */
      const addStaticLabels = (time: number, packingsData: VisualizePackingsData[]) => {
        const staticTimestamps = X_AXIS_TIMES.map(hour => setTimestamps(time, hour));
        const filteredStaticTimes = staticTimestamps.filter(hour => {
          return packingsData.some(packing => {
            return packing.time > hour;
          });
        });
        // TODO: why do i get an unlabled first tick outside of the x-axis (left) when using the filtered static times (disappears when use staticTimestamps). Also see console errors when using filteredStaticTimes rather than staticTimestamps?
        const labelData = createLabelPackings(filteredStaticTimes);
        labelData.forEach(label => packingsData.push(label))

        return staticTimestamps;
      };

      const staticLabels = addStaticLabels(packingsData[0].time, packingsData);

      packingsData.sort((a, b) => moment(a.time).toDate().getTime() - moment(b.time).toDate().getTime());

      /**
       * Accumulate the counts for packings data
       * 
       * @param packingsData packings data to visualize
       * @returns packings data with cumulative counts
       */
      const cumulativeCounts = (packingsData: VisualizePackingsData[]) => {
        packingsData.reduce((acc, packing, i) => {
          const count = packing.count || 0;
          packingsData[i] = { ...packingsData[i], count: acc + count };
          return acc + count;
        }, 0);
        return packingsData;
      };

      return (
        <>
          <LineChart
            width={1000}
            height={500}
            data={cumulativeCounts(packingsData)}
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
              tickFormatter={value => moment(value).format("LT")}
              padding={{ right: 100 }}
              ticks={ staticLabels }
              interval={ 0 }
              angle={ 320 }
              tickSize={ 10 }
            />
            <YAxis />
            <Tooltip
              labelFormatter={value => moment(value).format("LTS")}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#82ca9d"
              name={ strings.dashboardCount }
            />
          </LineChart>
        </>
      );
    };

    return (
      <Grid>
        <Grid.Row
          className="content-page-header-row"
          style={{ flex: 1, justifyContent: "space-between", paddingLeft: 10, paddingRight: 10 }}
        >
          <h2>{strings.dashboard}</h2>
        </Grid.Row>
        <Grid.Row>
          <Grid.Row>
            {renderForm()}
          </Grid.Row>
          {renderLineChart()}
        </Grid.Row>
        <Grid.Row>
        </Grid.Row>
        {possibleLoader()}
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
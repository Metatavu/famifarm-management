import * as React from "react";
import * as Keycloak from 'keycloak-js';
import Api from "../api";
import { Campaign, PackageSize, Packing, Product } from "../generated/client";
import strings from "../localization/strings";
import moment from "moment";
import * as actions from "../actions";
import { StoreState, ErrorMessage } from "../types/index";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import {
  Grid,
  Loader,
  Form,
  DropdownProps,
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
  filters: Filters;
  loading: boolean;
  allFound: boolean;
};

/**
 * Interface describing filters
 */
interface Filters {
  dateBefore?: string;
  dateAfter?: string;
};

/**
 * React component for displaying list of packings
 */
class Dashboard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      packings: [],
      loading: false,
      allFound: false,
      filters: {}
    };
  };

  /**
   * Component did mount life cycle event
   */
  public async componentDidMount() {
    try {
      await this.updatePackings(this.state.filters, false);
    } catch (e: any) {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
    // TODO: Could be better to make the api call to packings in this screen rather than get from the redux?
    this.state.packings?.length === 0 && this.setState({ packings: this.props.packings });
  };

  /**
   * Handles changing date
   *
   * @param e event
   * @param value value from DropdownProps
   */
    private onChangeDateBefore = async (e: any, { value }: DropdownProps) => {
      const updatedFilters: Filters = {
        ...this.state.filters,
        dateBefore: moment(value as any, "DD.MM.YYYY").toISOString()
      };
      this.setState({ filters: updatedFilters });
  
      await this.updatePackings(updatedFilters, false).catch((err) => {
        this.props.onError({
          message: strings.defaultApiErrorMessage,
          title: strings.defaultApiErrorTitle,
          exception: err
        });
      });
    };

  /**
   * Handles changing date
   *
   * @param e event
   * @param value value from DropdownProps
   */
  private onChangeDateAfter = async (e: any, { value }: DropdownProps) => {
    const updatedFilters: Filters = {
      ...this.state.filters,
      dateAfter: moment(value as any, "DD.MM.YYYY").toISOString()
    };

    this.setState({ filters: updatedFilters });

    await this.updatePackings(updatedFilters, false).catch(err => {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: err
      });
    });
  };
  
  /**
   * Handles changing date
   *
   * @param e event
   * @param value value from DropdownProps
   */
  private onChangeDate = async (e: any, { value }: DropdownProps) => {
    const updatedFilters: Filters = {
      ...this.state.filters,
      // TODO: Could use a new date param instead of setting before and after like this? Would require changes to the API.
      dateAfter: moment(value as any, "L").subtract(1, "days").toISOString(),
      dateBefore: moment(value as any, "L").add(1, "days").toISOString()
    };

    this.setState({ filters: updatedFilters });

    await this.updatePackings(updatedFilters, false).catch(err => {
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
  private updatePackings = async (filters: Filters, append: boolean) => {
    const { keycloak, onPackingsFound } = this.props;
    const { dateAfter, dateBefore } = filters;
    if (!keycloak) {
      return;
    }

    this.setState({ loading: true });
    const [ packingsService ] = await Promise.all([
      Api.getPackingsService(keycloak),
    ]);

    const packings  = await packingsService.listPackings({
      createdAfter: dateAfter,
      createdBefore: dateBefore,
    });
    onPackingsFound && onPackingsFound(append ? (this.props.packings || []).concat(packings) : packings);
    this.setState({ filters: filters, loading: false, allFound: packings.length < 20 });
  };
  
  /**
   * Renders date dropdown options
   */
  private renderDateOptions = () => {
    const { packings } =  this.state?.packings?.length ? this.state : this.props;
    const options = [];

    if (packings) {
      options.push(
        ...packings.map(({ time }) => ({
          text: moment(time as any, "LLLL").format("L") || "",
          value: moment(time as any, "LLLL").format("L") || ""
        }))
      );
    }

    const uniqueOptions = options.filter((item, index, self) => self.findIndex(t => t.value === item.value) === index);

    uniqueOptions.sort((a, b) => moment(a.value, "L").toDate().getTime() + moment(b.value, "L").toDate().getTime());

    return uniqueOptions;
  };

  /**
   * Render packing list view
   */
  public render() {
    const { packings } = this.props;
    const { filters } = this.state;

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
        paddingTop: "2rem",
        paddingBottom: "2rem",
        paddingRight: "2rem"
      };

      return (
        <Form>
          <Form.Field>
            <div style={ filterStyles }>
              <label>{ strings.dateBefore }</label>
              <DateInput
                dateFormat="DD.MM.YYYY"
                onChange={ this.onChangeDateBefore }
                name="dateBefore"
                value={ filters.dateBefore ? moment(filters.dateBefore).format("DD.MM.YYYY") : "" }
              />
            </div>
            <div style={ filterStyles }>
              <label>{ strings.dateAfter }</label>
              <DateInput
                dateFormat="DD.MM.YYYY"
                onChange={ this.onChangeDateAfter }
                name="dateAfter"
                value={ filters.dateAfter ? moment(filters.dateAfter).format("DD.MM.YYYY") : "" }
              />
            </div>
            <div style={ filterStyles }>
              <label>{ strings.selectDate }</label>
              <Form.Select
                name="Date"
                options={ this.renderDateOptions() }
                onChange={ this.onChangeDate }
                // TODO: have the value reset if date changed in other form inputs?
                value={ moment(filters.dateAfter).add(1, "days").format("L") || "" }
                placeholder=""
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

      const packingsData = packings?.map(packing => (
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

      return (  
        <>
          <LineChart
            width={1000}
            height={500}
            data={packingsData}
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
              tickFormatter={(value) => isMoreThanOneDay ? moment(value).format("L") : moment(value).format("LT") }
              interval="preserveStartEnd"
              padding={{ left: 100, right: 100 }}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(value) => isMoreThanOneDay ? moment(value).format("L") : moment(value).format("LTS") }
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
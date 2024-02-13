import * as React from "react";
import * as Keycloak from 'keycloak-js';
import Api from "../api";
import {
  PackageSize,
  Event,
  CultivationObservationEventData,
  HarvestEventData,
  PlantingEventData,
  SowingEventData,
  TableSpreadEventData,
  WastageEventData,
  PerformedCultivationAction,
  Pest,
  ProductionLine,
  SeedBatch,
  WastageReason,
  Seed,
  EventType,
  Product,
  Facility,
  HarvestBasket} from "../generated/client";
import { Navigate } from 'react-router-dom';
import strings from "../localization/strings";
import { DateTimeInput, DateInput } from 'semantic-ui-calendar-react';
import * as actions from "../actions";
import { StoreState } from "../types/index";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import {
  Grid,
  Button,
  Loader,
  Form,
  Message,
  DropdownProps,
  Confirm,
  TextAreaProps,
  DropdownItemProps,
  InputOnChangeData,
  Icon,
} from "semantic-ui-react";
import LocalizedUtils from "../localization/localizedutils";
import moment from "moment";
import { ErrorMessage } from "../types";
import { FormContainer } from "./FormContainer";
import { Select } from "semantic-ui-react";

/**
 * Interface representing component properties
 */
interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  facility: Facility;
  onError: (error: ErrorMessage | undefined) => void;
}

/**
 * Interface representing component state
 */
interface State {
  open: boolean;
  loading: boolean;
  saving: boolean;
  messageVisible: boolean;
  redirect: boolean;
  event: Partial<Event>;
  performedCultivationActions?: PerformedCultivationAction[];
  pests?: Pest[];
  productionLines?: ProductionLine[];
  packageSizes?: PackageSize[];
  seedBatches?: SeedBatch[];
  seeds: Seed[];
  products: Product[];
  wastageReasons?: WastageReason[];
}

/**
 * React component for edit event view
 */
class CreateEvent extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component props
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      seeds: [],
      products: [],
      loading: false,
      redirect: false,
      saving: false,
      messageVisible: false,
      open: false,
      event: {}
    };
  }

  /**
   * Component did mount life-sycle method
   */
  public componentDidMount = async () => {
    const  { keycloak, facility } = this.props;
    if (!keycloak) {
      return;
    }

    this.setState({loading: true});

    const [seedsService, productsService] = await Promise.all([Api.getSeedsService(keycloak), Api.getProductsService(keycloak)]);
    const [seeds, products] = await Promise.all([seedsService.listSeeds({ facility: facility }), productsService.listProducts({ facility: facility })]);

    this.setState({
      loading: false,
      seeds: seeds,
      products: products,
      event: {
        startTime: moment().toDate(),
        endTime: moment().toDate(),
        data: {baskets: [{weight: 0}]},
        type: EventType.Sowing
      }
    });
  }

  public componentDidUpdate = (prevProps: Props, prevState: State) => {
    const prevData = (prevState.event ? prevState.event.data : {}) as any;
    const data = (this.state.event ? this.state.event.data : {}) as any;
    if (!data) {
      return;
    }

    if (data.productionLineId && data.productionLineId !== prevData.productionLineId) {
      const selectedProductionLine = data.productionLineId ? (this.state.productionLines || []).find((p => p.id == data.productionLineId)) : undefined;
      const defaultGutterHoleCount = selectedProductionLine ? selectedProductionLine.defaultGutterHoleCount : undefined;
      if (defaultGutterHoleCount) {
        data.gutterHoleCount = defaultGutterHoleCount;
        const event = this.state.event;
        if (!event) {
          return;
        }

        event.data = data;
        this.setState({
          event: event
        });
      }
    }
  }

  private updateDefaultHoleCount = () => {
    const data = (this.state.event ? this.state.event.data : {}) as any;
    const selectedProductionLine = data.productionLineId ? (this.state.productionLines || []).find((p => p.id == data.productionLineId)) : undefined;
    const defaultGutterHoleCount = selectedProductionLine ? selectedProductionLine.defaultGutterHoleCount : undefined;
    if (defaultGutterHoleCount) {
      data.gutterHoleCount = defaultGutterHoleCount;
      const event = this.state.event;
      if (!event) {
        return;
      }

      event.data = data;
      this.setState({
        event: event
      });
    }
  }

  /**
   * Render edit product view
   */
  public render() {
    if (this.state.loading) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader inline active size="medium" />
        </Grid>
      );
    }

    if (this.state.redirect) {
      return <Navigate replace={true} to="/events"/>;
    }

    if (!this.state.event) {
      return null;
    }
    const { event } = this.state;
    const eventTypeOptions = [
      "SOWING",
      "TABLE_SPREAD",
      "PLANTING",
      "CULTIVATION_OBSERVATION",
      "HARVEST",
      "WASTAGE"].map((eventType) => {
      return {
        key: eventType,
        value: eventType,
        text: (strings as any)[`phase${eventType}`]
      };
    });

    const productOptions: DropdownItemProps[] = [{ key: "", value: "", text: "", }].concat(this.state.products.map((product) => {
      const id = product.id!;
      const name = LocalizedUtils.getLocalizedValue(product.name);

      return {
        key: id,
        value: id,
        text: name
      };
    }));

    return (
      <Grid>
        <Grid.Row className="content-page-header-row">
          <Grid.Column width={6}>
            <h2>{strings.addEventHeader}</h2>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
            <FormContainer>
              <Form.Field required>
                <label>{strings.batchProduct}</label>
                <Select options={ productOptions } value={ event.productId || "" } onChange={ this.handleProductChange }/>
              </Form.Field>
              <Form.Field required>
                <label>{strings.labelStartTime}</label>
                <DateTimeInput localization="fi-FI" dateTimeFormat="DD.MM.YYYY HH:mm" onChange={this.handleTimeChange} name="startTime" value={moment(event.startTime).format("DD.MM.YYYY HH:mm")} />
              </Form.Field>
              <Form.Field>
                <label>{strings.labelEndTime}</label>
                <DateTimeInput localization="fi-FI" dateTimeFormat="DD.MM.YYYY HH:mm" onChange={this.handleTimeChange} name="endTime" value={moment(event.endTime).format("DD.MM.YYYY HH:mm")} />
              </Form.Field>
              <Form.Select required label={strings.labelEventType} name="type" options={eventTypeOptions} value={event.type} onChange={this.handleBaseChange} />
              {this.renderEventDataForm(event)}
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
              <Button onClick={() => this.setState({redirect: true})}>
                {strings.goBack}
              </Button>
            </FormContainer>
          </Grid.Column>
        </Grid.Row>
        <Confirm open={this.state.open} size={"mini"} content={strings.deleteEventConfirmText} onCancel={()=>this.setState({open:false})} onConfirm={this.handleDelete} />
      </Grid>
    );
  }

    /**
   * Handle value change
   *
   * @param event event
   */
  private handleTimeChange = (e: any, { name, value }: DropdownProps | TextAreaProps) => {
    const eventData: any = this.state.event;
    if (!eventData) {
      return;
    }

    eventData[name] = moment(value as any, "DD.MM.YYYY HH:mm").toDate()
    this.setState({ event: eventData });
  }

  /**
   * Event handler for product change
   */
  private handleProductChange = (event: React.SyntheticEvent<HTMLElement>, data: DropdownProps) => {
    this.setState({
      event: {...this.state.event, productId: data.value as string}
    });
  }

  /**
   * Handle value change
   *
   * @param event event
   */
  private handleBaseChange = (e: any, { name, value }: DropdownProps | TextAreaProps) => {
    const eventData: any = this.state.event;
    if (!eventData) {
      return;
    }

    eventData[name] = value;
    this.setState({ event: { ...eventData } });
  }

  /**
   * Handle value change
   *
   * @param event event
   */
  private handleDataChange = (e: any, { name, value }: InputOnChangeData | DropdownProps | TextAreaProps) => {
    const eventData = {...this.state.event} as any;
    if (!eventData) {
      return;
    }

    if (name.includes("baskets")) {
      const basketNumber = name.split("-")[1];
      eventData.data.baskets[basketNumber].weight = value;
      this.setState({ event: eventData });
      return;
    }

    eventData.data = {...this.state.event!.data};
    eventData.data[name] = value;
    this.setState({ event: { ...eventData } });
  }

  /**
   * Handle value change
   *
   * @param event event
   */
  private handleDataTimeChange = (e: any, { name, value }: DropdownProps | TextAreaProps) => {
    const eventData = {...this.state.event} as any;
    if (!eventData) {
      return;
    }

    eventData.data = {...this.state.event!.data};
    eventData.data[name] = moment(value as any, "DD.MM.YYYY").toDate()
    console.log(eventData);
    this.setState({ event: { ...eventData } });
  }

  private sortProductionLines = (productionLines: ProductionLine[]) => {
    return productionLines.sort((a, b) => {
      let nameA = this.getStringsNumber(a.lineNumber)
      let nameB = this.getStringsNumber(b.lineNumber)
      if(nameA < nameB) { return -1; }
      if(nameA > nameB) { return 1; }
      return 0;
    });
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
   * Adds an empty basket to baskets
   */
  private addBasket = () => {
    const eventData: any = this.state.event;
    if (!eventData) {
      return;
    }

    const newBasket = {
      weight: 0
    }
    eventData.data.baskets = [...eventData.data.baskets, newBasket];

    this.setState({ event: eventData })
  }

  /**
   * Removes the selected basket from baskets
   */
  private removeBasket = (basketIndex: number) => {
    const eventData: any = this.state.event;
    if (!eventData) {
      return;
    }

    const updatedBaskets = eventData.data.baskets.filter((_basket: HarvestBasket, index: number) => index !== basketIndex);
    eventData.data.baskets = [...updatedBaskets];
    this.setState({ event: eventData });
  }

  /**
   * Handle form submit
   */
  private handleSubmit = async () => {
    const { event } = this.state;
    const { keycloak, facility, onError } = this.props;
    try {
      if (!keycloak || !event) {
        return;
      }

      this.setState({saving: true});
      const eventsService = await Api.getEventsService(keycloak);

      const eventData = event.data as any;
      let data = {};
      switch (event.type) {
        case "CULTIVATION_OBSERVATION":
          data = {
            luminance: eventData.luminance,
            performedActionIds: eventData.performedActionIds,
            pestIds: eventData.pestIds,
            weight: eventData.weight
          } as CultivationObservationEventData;
        break;
        case "HARVEST":
          data = {
            gutterCount: eventData.gutterCount,
            gutterHoleCount: eventData.gutterHoleCount,
            baskets: facility === Facility.Juva
              ? eventData.baskets : [],
            productionLineId: eventData.productionLineId,
            type: eventData.type,
            sowingDate: moment(eventData.sowingDate).toDate()
          } as HarvestEventData;
        break;
        case "PLANTING":
          data = {
            gutterCount: eventData.gutterCount,
            gutterHoleCount: eventData.gutterHoleCount,
            productionLineId: eventData.productionLineId,
            trayCount: eventData.trayCount,
            workerCount: eventData.workerCount,
            sowingDate: moment(eventData.sowingDate).toDate()
          } as PlantingEventData;
        break;
        case "SOWING":
          data = {
            amount: eventData.amount,
            productionLineId: eventData.productionLineId,
            seedBatchIds: eventData.seedBatchIds
          } as SowingEventData;
        break;
        case "TABLE_SPREAD":
          data = {
            trayCount: eventData.trayCount
          } as TableSpreadEventData;
        break;
        case "WASTAGE":
          data = {
            amount: eventData.amount,
            phase: eventData.phase,
            productionLineId: eventData.productionLineId,
            reasonId: eventData.reasonId
          } as WastageEventData;
        break;
      }
      event.data = data;

      await eventsService.createEvent({
        event: event as Event,
        facility: facility
      });
      this.setState({saving: false, messageVisible: true});
      setTimeout(() => {
        this.setState({messageVisible: false});
      }, 3000);
    } catch (e: any) {
      console.error(e);
      onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
  }

  /**
   * Handle product delete
   */
  private handleDelete = async () => {
    const { event } = this.state;
    const { keycloak, facility, onError } = this.props;
    try {
      if (!keycloak || !event) {
        return;
      }

      const eventsService = await Api.getEventsService(keycloak);
      const id = event.id || "";

      await eventsService.deleteEvent({
        eventId: id,
        facility: facility
      });

      this.setState({redirect: true});
    } catch (e: any) {
      onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
  }

  /**
   * Renders form suitable for specific event type
   */
  private renderEventDataForm = (event: Partial<Event>) => {
    switch (event.type) {
      case "CULTIVATION_OBSERVATION":
        return this.renderCultivationObservationDataForm(event.data as CultivationObservationEventData);
      case "HARVEST":
        return this.renderHarvesDataForm(event.data as HarvestEventData);
      case "PLANTING":
        return this.renderPlantingDataForm(event.data as PlantingEventData);
      case "SOWING":
        return this.renderSowingDataForm(event.data as SowingEventData);
      case "TABLE_SPREAD":
        return this.renderTableSpreadDataForm(event.data as TableSpreadEventData);
      case "WASTAGE":
        return this.renderWastageDataForm(event.data as WastageEventData);
      default:
        return null;
    }
  }

  /**
   * Renders cultivation observations event form
   */
  private renderCultivationObservationDataForm = (data: CultivationObservationEventData) => {
    if (!this.state.performedCultivationActions || !this.state.pests) {
      this.loadCultivationObservationData().catch((e) => {
        this.props.onError({
          message: strings.defaultApiErrorMessage,
          title: strings.defaultApiErrorTitle,
          exception: e
        });
      });

      return;
    }

    const performedActionsOptions = this.state.performedCultivationActions.map((performedCultivationAction) => {
      return {
        key: performedCultivationAction.id,
        value: performedCultivationAction.id,
        text: LocalizedUtils.getLocalizedValue(performedCultivationAction.name)
      };
    });

    const pestOptions = this.state.pests.map((pest) => {
      return {
        key: pest.id,
        value: pest.id,
        text: LocalizedUtils.getLocalizedValue(pest.name)
      };
    });

    return (
      <React.Fragment>
        <Form.Input label={strings.labelLuminance} name="luminance" onChange={this.handleDataChange} value={data.luminance} />
        <Form.Input label={strings.labelWeight} name="weight" onChange={this.handleDataChange} value={data.weight} />
        <Form.Select label={strings.labelPerformedCultivationActions} name="performedActionIds" options={performedActionsOptions} multiple value={data.performedActionIds} onChange={this.handleDataChange} />
        <Form.Select label={strings.labelPests} name="pestIds" options={pestOptions} multiple value={data.pestIds} onChange={this.handleDataChange} />
      </React.Fragment>
    );
  }

  /**
   * Renders harvest event form
   */
  private renderHarvesDataForm = (data: HarvestEventData) => {
    if (!this.state.productionLines) {
      this.loadHarvestData().catch((e) => {
        this.props.onError({
          message: strings.defaultApiErrorMessage,
          title: strings.defaultApiErrorTitle,
          exception: e
        });
      });

      return;
    }

    const productionLineOptions = this.state.productionLines.map((productionLine) => {
      return {
        key: productionLine.id,
        value: productionLine.id,
        text: productionLine.lineNumber
      };
    });

    const selectedProductId = this.state.event.productId;
    const selectedProduct = selectedProductId ?
      this.state.products.find(product => product.id === selectedProductId)
      : undefined;

    const harvestTypeOptions = (selectedProduct ? selectedProduct.allowedHarvestTypes || [] : []).map((harvestType) => {
      return {
        key: harvestType,
        value: harvestType,
        text: strings.getString(`harvestType${harvestType}`, strings.getLanguage())
      };
    });

    return (
      <React.Fragment>
        <Form.Field required>
          <label>{strings.labelSowingDate}</label>
          <DateInput localization="fi-FI" dateTimeFormat="DD.MM.YYYY" onChange={this.handleDataTimeChange} name="sowingDate" value={data.sowingDate ? moment(data.sowingDate).format("DD.MM.YYYY") : ""} />
        </Form.Field>
        <Form.Select required label={strings.labelHarvestType} name="type" options={harvestTypeOptions} value={data.type} onChange={this.handleDataChange} />
        <Form.Input  required label={strings.labelGutterCount} name="gutterCount" type="number" value={data.gutterCount} onChange={this.handleDataChange} />
        <Form.Select required label={strings.labelProductionLine} name="productionLineId" options={productionLineOptions} value={data.productionLineId} onChange={this.handleDataChange} />
        <Form.Input required label={strings.labelGutterHoleCount} name="gutterHoleCount" type="number" value={data.gutterHoleCount} onChange={this.handleDataChange} />
        {this.props.facility === Facility.Juva &&
          data.baskets?.map((basket, index) =>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
            <Form.Input required label={index === 0 && strings.labelBasketWeights} name={`baskets-${index}`} type="number" value={basket.weight} onChange={this.handleDataChange} />
            <Button className="danger-button" style={{ marginLeft: 5, marginBottom: index === 0 ? "-10px" : 14, padding: 0, justifyContent: "center", height: 36, width: 36 }} onClick={() => this.removeBasket(index)}>
              <Icon fitted name="trash" />
            </Button>
          </div>)}
        <Button className="submit-button" onClick={() => this.addBasket()}>
          {strings.labelAddBasket}
          <Icon name="add" size="small" style={{ paddingLeft : 10 }} />
        </Button>
      </React.Fragment>
    )
  }

  /**
   * Renders planting event form
   */
  private renderPlantingDataForm = (data: PlantingEventData) => {
    if (!this.state.productionLines) {
      this.loadPlantingData().catch((e) => {
        this.props.onError({
          message: strings.defaultApiErrorMessage,
          title: strings.defaultApiErrorTitle,
          exception: e
        });
      });

      return;
    }

    const productionLineOptions = this.state.productionLines.map((productionLine) => {
      return {
        key: productionLine.id,
        value: productionLine.id,
        text: productionLine.lineNumber
      };
    });

    return (
      <React.Fragment>
        <Form.Field required>
          <label>{strings.labelSowingDate}</label>
          <DateInput localization="fi-FI" dateTimeFormat="DD.MM.YYYY" onChange={this.handleDataTimeChange} name="sowingDate" value={data.sowingDate ? moment(data.sowingDate).format("DD.MM.YYYY") : ""} />
        </Form.Field>
        <Form.Select required label={strings.labelProductionLine} name="productionLineId" options={productionLineOptions} value={data.productionLineId} onChange={this.handleDataChange} />
        <Form.Input required label={strings.labelTrayCount} name="trayCount" type="number" value={data.trayCount} onChange={this.handleDataChange} />
        <Form.Input required label={strings.labelGutterCount} name="gutterCount" type="number" value={data.gutterCount} onChange={this.handleDataChange} />
        <Form.Input required label={strings.labelGutterHoleCount} name="gutterHoleCount" type="number" value={data.gutterHoleCount} onChange={this.handleDataChange} />
        <Form.Input required label={strings.labelWorkerCount} name="workerCount" type="number" value={data.workerCount} onChange={this.handleDataChange} />
      </React.Fragment>
    );
  }

  /**
   * Renders sowing event form
   */
  private renderSowingDataForm = (data: SowingEventData) => {
    if (!this.state.productionLines || !this.state.seedBatches) {
      this.loadSowingData().catch((e) => {
        this.props.onError({
          message: strings.defaultApiErrorMessage,
          title: strings.defaultApiErrorTitle,
          exception: e
        });
      });

      return;
    }

    const productionLineOptions = this.state.productionLines.map((productionLine) => {
      return {
        key: productionLine.id,
        value: productionLine.id,
        text: productionLine.lineNumber
      };
    });

    const getSeedName = (seedId?:String): any => {
      if (this.state.seeds === null || this.state.seeds === undefined) {
        return
      }
      const seed = this.state.seeds.find(seed => seed.id === seedId)
      if (seed === null || seed === undefined) {
        return
      }
      return LocalizedUtils.getLocalizedValue(seed.name)
    }

    const seedBatchOptions = this.state.seedBatches.map((seedBatch) => {
      return {
        key: seedBatch.id,
        value: seedBatch.id,
        text: seedBatch.code + " " + getSeedName(seedBatch.seedId)
      };
    });

    return (
      <React.Fragment>
        <Form.Input required label={strings.labelTrayCount} name="amount" type="number" value={data.amount} onChange={this.handleDataChange} />
        <Form.Select required label={strings.labelProductionLine} name="productionLineId" options={productionLineOptions} value={data.productionLineId} onChange={this.handleDataChange} />
        <Form.Select required label={strings.labelSeedBatch} name="seedBatchIds" options={seedBatchOptions} multiple value={data.seedBatchIds} onChange={this.handleDataChange} />
      </React.Fragment>
    );
  }


  /**
   * Renders table spread event form
   */
  private renderTableSpreadDataForm = (data: TableSpreadEventData) => {
    return (
      <React.Fragment>
        <Form.Input required label={strings.labelTrayCount} name="trayCount" value={data.trayCount} onChange={this.handleDataChange} />
      </React.Fragment>
    );
  }


  /**
   * Renders wastage event form
   */
  private renderWastageDataForm = (data: WastageEventData) => {
    if (!this.state.productionLines || !this.state.wastageReasons) {
      this.loadWastageData().catch((e) => {
        this.props.onError({
          message: strings.defaultApiErrorMessage,
          title: strings.defaultApiErrorTitle,
          exception: e
        });
      });

      return;
    }

    const wastageReasonOptions = this.state.wastageReasons.map((wastageReason) => {
      return {
        key: wastageReason.id,
        value: wastageReason.id,
        text: LocalizedUtils.getLocalizedValue(wastageReason.reason)
      };
    });

    const productionLineOptions = this.state.productionLines.map((productionLine) => {
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
      <React.Fragment>
        <Form.Select required label={strings.labelWastageReason} name="reasonId" options={wastageReasonOptions} value={data.reasonId} onChange={this.handleDataChange} />
        <Form.Select label={strings.labelProductionLine} name="productionLineId" options={productionLineOptions} value={data.productionLineId} onChange={this.handleDataChange} />
        <Form.Select label={strings.labelPhase} name="phase" options={phaseOptions} value={data.phase} onChange={this.handleDataChange} />
        <Form.Input required label={strings.labelAmount} name="amount" type="number" value={data.amount} onChange={this.handleDataChange} />
      </React.Fragment>
    );
  }

  /**
   * Loads data required for harvest event
   */
  private loadHarvestData = async () => {
    const { keycloak, facility } = this.props;
    if (!keycloak) {
      return;
    }

    this.setState({loading: true});
    const productionLinesService = await Api.getProductionLinesService(keycloak);

    const productionLines = await productionLinesService.listProductionLines({ facility: facility });

    this.setState({
      loading: false,
      productionLines: this.sortProductionLines(productionLines)
    });

    this.updateDefaultHoleCount();
  }

  /**
   * Loads data required for observations event
   */
  private loadCultivationObservationData = async () => {
    const { keycloak, facility } = this.props;
    if (!keycloak) {
      return;
    }

    this.setState({loading: true});
    const [performedCultivationActionsService, pestsService] = await Promise.all([
      Api.getPerformedCultivationActionsService(keycloak),
      Api.getPestsService(keycloak)
    ]);

    const [performedCultivationActions, pests] = await Promise.all([
      performedCultivationActionsService.listPerformedCultivationActions({ facility: facility }),
      pestsService.listPests({ facility: facility })
    ]);

    this.setState({
      loading: false,
      pests: pests,
      performedCultivationActions: performedCultivationActions
    });
  }

  /**
   * Loads data required for planting event
   */
  private loadPlantingData = async () => {
    const { facility, keycloak } = this.props;
    if (!keycloak) {
      return;
    }

    this.setState({loading: true});
    const getProductionLinesService = await Api.getProductionLinesService(keycloak);
    const productionLines = await getProductionLinesService.listProductionLines({ facility: facility });

    this.setState({
      loading: false,
      productionLines: this.sortProductionLines(productionLines)
    });

    this.updateDefaultHoleCount();
  }

  /**
   * Loads data required for sowing event
   */
  private loadSowingData = async () => {
    const { keycloak, facility } = this.props;
    if (!keycloak) {
      return;
    }

    this.setState({loading: true});
    const [seedBatchesService, productionLinesService] = await Promise.all([
      Api.getSeedBatchesService(keycloak),
      Api.getProductionLinesService(keycloak)
    ]);

    const [seedBatches, productionLines] = await Promise.all([
      seedBatchesService.listSeedBatches({ facility: facility }),
      productionLinesService.listProductionLines({ facility: facility })
    ]);

    this.setState({
      loading: false,
      seedBatches: seedBatches,
      productionLines: this.sortProductionLines(productionLines)
    });

    this.updateDefaultHoleCount();
  }

  /**
   * Loads data required for wastage event
   */
  private loadWastageData = async () => {
    const { keycloak, facility } = this.props;
    if (!keycloak) {
      return;
    }

    this.setState({loading: true});
    const [wastageReasonsService, productionLinesService] = await Promise.all([
      Api.getWastageReasonsService(keycloak),
      Api.getProductionLinesService(keycloak)
    ]);

    const [wastageReasons, productionLines] = await Promise.all([
      wastageReasonsService.listWastageReasons({ facility: facility }),
      productionLinesService.listProductionLines({ facility: facility })
    ]);

    this.setState({
      loading: false,
      wastageReasons: wastageReasons,
      productionLines: this.sortProductionLines(productionLines)
    });

    this.updateDefaultHoleCount();
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
export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
     onError: (error: ErrorMessage | undefined) => dispatch(actions.onErrorOccurred(error))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateEvent);
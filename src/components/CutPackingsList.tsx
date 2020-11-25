import { CutPacking, Product } from "famifarm-typescript-models";
import { KeycloakInstance } from "keycloak-js";
import * as React from "react";
import Api from "../api";
import strings from "src/localization/strings";
import LocalizedUtils from "src/localization/localizedutils";
import { Button, Form, Grid, InputOnChangeData, List, Loader } from "semantic-ui-react";
import { NavLink } from "react-router-dom";
import { DateInput } from 'semantic-ui-calendar-react';
import * as moment from "moment";

interface Props {
  keycloak?: KeycloakInstance;
}

interface State {
  listItems: PackingListItem[];
  loading: boolean;
  createdBeforeFilter?: string;
  createdAfterFilter?: string;
  products: Product[];
  selectedProductName?: string;
  selectedProductId?: string;
}

interface PackingListItem {
  name: string;
  id: string;
}

class CutPackingsList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      listItems: [],
      loading: false,
      products: []
    };
  }

  public componentDidMount = async () => {
    const { keycloak } = this.props;

    if (!keycloak) {
      return;
    }

    this.setState({ loading: true });
    const [cutPackingsApi, productsApi] = await Promise.all([Api.getCutPackingsService(keycloak), Api.getProductsService(keycloak)]);
    const [cutPackings, products] = await Promise.all([cutPackingsApi.listPackings(), productsApi.listProducts()]);
    const listItems = this.getPackingsListItems(cutPackings, products);

    this.setState({ listItems, loading: false, products });
  }

  public render = () => {
    const { loading, createdAfterFilter, createdBeforeFilter } = this.state;

    if (loading) {
      return (
        <Grid style={{ paddingToSWSsp: "100px" }} centered>
          <Loader inline active size="medium" />
        </Grid>
      );
    }

    return (
      <Grid>
        <Grid.Row className="content-page-header-row" style={{flex: 1,justifyContent: "space-between", paddingLeft: 10, paddingRight: 10}}>
          <h2>{strings.cutPackings}</h2>
          <NavLink to="/createPacking">
            <Button className="submit-button">{strings.newPacking}</Button>
          </NavLink>
        </Grid.Row>
        <Grid.Row>
          <Form>
            <Form.Field>
              <div style={{display:"inline-block", paddingTop: "2rem", paddingBottom: "2rem", paddingRight: "2rem"}}>
                <label>{strings.dateBefore}</label>
                <DateInput dateFormat="DD.MM.YYYY" onChange={ this.onChangeCreatedBefore } name="dateBefore" value={ createdBeforeFilter ? moment(this.state.createdBeforeFilter).format("DD.MM.YYYY") : "" } />
              </div>
              <div style={{ display:"inline-block", paddingTop: "2rem", paddingBottom: "2rem", paddingRight: "2rem" }}>
                <label>{strings.dateAfter}</label>
                <DateInput dateFormat="DD.MM.YYYY" onChange={ this.onChangeCreatedAfter } name="dateAfter" value={ createdAfterFilter ? moment(createdAfterFilter).format("DD.MM.YYYY") : "" } />
              </div>
              <div style={{ display:"inline-block", paddingTop: "2rem", paddingBottom: "2rem", paddingRight: "2rem" }}>
                <label>{strings.productName}</label>
                <Form.Select name="product" options={ this.renderProductOptions() } text={ this.state.selectedProductName ? this.state.selectedProductName : strings.selectProduct } onChange={ this.onChangeProduct } />
              </div>
            </Form.Field>
          </Form>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <List divided animated verticalAlign='middle'>
              { this.renderListItems }
            </List>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }

  private updateCutPackingsList = async (productId?: string, createdBefore?: string, createdAfter?: string) => {
    const { keycloak } = this.props;

    if (!keycloak) {
      return;
    }

    this.setState({ loading: true });
    const cutPackingsApi = await Api.getCutPackingsService(keycloak);
    const cutPackings = await cutPackingsApi.listPackings(undefined, undefined, productId, createdBefore, createdAfter);
    const listItems = this.getPackingsListItems(cutPackings, this.state.products);

    this.setState({ listItems, loading: false });
  }

  /**
   * Renders product options
   */
  private renderProductOptions = () => {
    const { products } = this.state;


    let options = [{text: strings.allProducts, value: ""}];
    for (let i = 0; i < products.length; i++) {
      options.push({text: LocalizedUtils.getLocalizedValue(products[i].name) || "", value: products[i].id || ""});
    }
    
    return options;
  }

  /**
   * Handles changing date filter
   */
  private onChangeCreatedAfter = async (e: any, { value }: InputOnChangeData) => {
    this.setState({ createdAfterFilter: moment(value, "DD.MM.YYYY").toISOString() });
    await this.updateCutPackingsList(this.state.selectedProductId)
  }

  /**
   * Handles changing date filter
   */
  private onChangeCreatedBefore = async (e: any, { value }: InputOnChangeData) => {
    this.setState({ createdBeforeFilter: moment(value, "DD.MM.YYYY").toISOString() });
  }

  /**
   * Handles changing selected product
   */
  private onChangeProduct = async (e: any, { name, value }: InputOnChangeData) => {
    let productName = "";

    const product = this.state.products.find(product => product.id === value);
    if (product) {
      productName = LocalizedUtils.getLocalizedValue(product.name) || "";
    }

    this.setState({
      selectedProductName: productName
    });

  }

  private renderListItems = () => {
    return this.state.listItems.map((item, i) => {
      return (
        <List.Item style={i % 2 == 0 ? { backgroundColor: "#ddd" } : {}} key={i}>
          <List.Content floated='right'>
            <NavLink to={`/cutPackings/${item.id}`}>
              <Button className="submit-button">{strings.open}</Button>
            </NavLink>
          </List.Content>
          <List.Content>
            <List.Header style={{ paddingTop: "10px" }}>
              {item.name}
            </List.Header>
          </List.Content>
        </List.Item>
      );
    });
  }

  private getPackingsListItems = (cutPackings: CutPacking[], products: Product[]): PackingListItem[] => {
    return cutPackings.map(packing => {
      const productName = LocalizedUtils.getLocalizedValue(products.find(product => product.id === packing.productId)?.name) || packing.productId;

      return { name: this.getPackingName(productName, packing.cuttingDay), id: packing.id! };
    });
  }

  private getPackingName = (productName: string, cuttingDay: string) => {
    return `${productName} : ${strings.cut} ${cuttingDay}`
  }
}
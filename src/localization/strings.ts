import LocalizedStrings, { 
  LocalizedStringsMethods
} from 'localized-strings';

export interface IStrings extends LocalizedStringsMethods {
  managementHeaderText: string;
  save: string;
  date: string;
  open: string;
  savedSuccessfully: string;
  delete: string;

  packageSize: string;
  packageSizes: string;
  newPackageSize: string;
  packageSizeName: string;

  product: string;
  products: string;
  newProduct: string;
  productName: string;
  
  productionLine: string;
  productionLines: string;
  newProductionLine: string;
  productionLineNumber: string;
  productionLineNotNumber: string;

  seed: string;
  seeds: string;
  newSeed: string;
  seedName: string;

  seedBatch: string;
  seedBatches: string;
  newSeedBatch: string;
  seedBatchCode: string;
  seedBatchArrived: string;

  team: string;
  teams: string;
  newTeam: string;
  teamName: string;
  deleteTeam: string

  performedCultivationAction: string;
  performedCultivationActions: string;
  newPerformedCultivationAction: string;
  performedCultivationActionName: string;
  deletePerformedCultivationAction: string;
}

const strings: IStrings = new LocalizedStrings({
  en: require("./en.json")
});

export default strings;
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

  batches: string

  sowingEventHeader: string
  sowingEventText: string

  tablespreadEventHeader: string
  tablespreadEventText: string

  plantingEventHeader: string
  plantingEventText: string

  observationsEventHeader: string
  observationsEventText: string

  harvestEventHeader: string
  harvestEventText: string

  packingEventHeader: string
  packingEventText: string

  wastageEventHeader: string
  wastageEventText: string

  unknownEventHeader: string

  wastageReason: string
  wastageReasons: string
  newWastageReason: string
  wastageReasonReason: string
  deleteConfirmationText: string
}

const strings: IStrings = new LocalizedStrings({
  en: require("./en.json"),
  fi: require("./fi.json")
});

export default strings;
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
  luminanceObservationText: string
  weightObservationText: string
  pestObservationText: string


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

  pests: string
  newPest: string
  pestName: string

  remainingUnitsText: string
  batchStatusButtonOPEN: string
  batchStatusButtonCLOSED: string
  batchStatusButtonNEGATIVE: string

  labelPhase: string
  labelProductionLine: string
  labelWastageReason: string
  labelLocation: string
  labelTableCount: string
  labelCellType: string
  labelSeedBatch: string
  labelAmount: string
  labelWorkerCount: string
  labelGutterSize: string
  labelGutterCount: string
  labelCellCount: string
  labelPackageSize: string
  labelPackedAmount: string
  labelTeam: string
  labelHarvestType: string
  labelPests: string
  labelPerformedCultivationActions: string
  labelWeight: string
  labelLuminance: string
  labelStartTime: string
  labelEndTime: string
  editEventHeader: string
  deleteEventConfirmText: string
  harvestTypeBAGGING: string
  harvestTypeCUTTING: string
  harvestTypeBOXING: string
  cellTypeSMALL: string
  cellTypeLARGE: string
  phasePLANTING: string
  phaseSOWING: string
  phasePACKING: string
  phaseTABLE_SPREAD: string
  phaseCULTIVATION_OBSERVATION: string
  phaseHARVEST: string
  editEventLink: string
  labelAdditionalInformation: string
  goBack: string
  siteHeader: string
  siteSubHeader: string

  reportDownloadHeader: string
  reportTypeLabel: string
  reportTypePlaceholder: string
  reportTypeItemWASTAGE: string
  reportTypeItemGROWTH_TIME: string
  reportTypeItemYIELD: string
  reportTypeItemPLANTING_YIELD: string
  userManagementLink: string
  accountUrl: string
  logoutUrl: string
}

const strings: IStrings = new LocalizedStrings({
  en: require("./en.json"),
  fi: require("./fi.json")
});

export default strings;
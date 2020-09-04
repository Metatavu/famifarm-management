import LocalizedStrings, { 
  LocalizedStringsMethods
} from 'localized-strings';

export interface IStrings extends LocalizedStringsMethods {

  errorRetryText: string,
  errorSupportText: string,
  errorRetryHere: string,
  defaultErrorTitle: string,
  defaultErrorMessage: string,
  defaultApiErrorTitle: string,
  defaultApiErrorMessage: string,
  connectionErrorText: string,
  connectionSuccessText: string

  managementHeaderText: string;
  save: string;
  date: string;
  dateAfter: string;
  dateBefore: string;
  open: string;
  savedSuccessfully: string;
  delete: string;

  packageSize: string;
  packageSizes: string;
  newPackageSize: string;
  packageSizeName: string;
  packageSizeSize: string;

  product: string;
  products: string;
  allProducts: string;
  newProduct: string;
  productName: string;
  selectProduct: string;
  
  productionLine: string;
  productionLines: string;
  newProductionLine: string;
  productionLineNumber: string;
  productionLineDefaultGutterHoleCount: string;
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

  performedCultivationAction: string;
  performedCultivationActions: string;
  newPerformedCultivationAction: string;
  performedCultivationActionName: string;
  deletePerformedCultivationAction: string;

  batches: string,
  newBatch: string,
  editBatch: string,
  batchPhase: string,
  batchProduct: string,
  batchNoEvents: string,
  batchPhaseSOWING: string,
  batchPhaseTABLE_SPREAD: string,
  batchPhasePLANTING: string,
  batchPhaseHARVEST: string,
  batchPhaseCOMPLETE: string,

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
  processedUnitsText: string
  batchStatusButtonOPEN: string
  batchStatusButtonCLOSED: string
  batchStatusButtonNEGATIVE: string

  labelPhase: string
  labelProductionLine: string
  labelWastageReason: string
  labelLocation: string
  labelPotType: string
  labelSeedBatch: string
  labelWorkerCount: string
  labelAmount: string
  labelGutterHoleCount: string
  labelGutterCount: string
  labelTrayCount: string
  labelPackageSize: string
  labelPackedCount: string
  labelHarvestType: string
  labelPests: string
  labelPerformedCultivationActions: string
  labelWeight: string
  labelLuminance: string
  labelStartTime: string
  labelEndTime: string
  labelEventType: string
  editEventHeader: string
  deleteEventConfirmText: string
  harvestTypeBAGGING: string
  harvestTypeCUTTING: string
  harvestTypeBOXING: string
  potTypeSMALL: string
  potTypeLARGE: string
  phasePLANTING: string
  phaseSOWING: string
  phaseTABLE_SPREAD: string
  phaseWASTAGE: string,
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
  reportTypeItemSOWED: string
  reportTypeItemPLANTED: string
  reportTypeItemSPREAD: string
  reportTypeItemHARVESTED: string
  reportTypeItemPACKED: string
  userManagementLink: string
  accountUrl: string
  logoutUrl: string
  newEvent: string
  addEventHeader: string

  missingRequiredFieldError: string
  logPhaseWastage: string
  logPhaseWastageHeader: string
  deleteBatchConfirmText: string
  deleteBatchButtonText: string
  batchDeletionError: string
  batchDeletionSuccess: string
  batchDeletingInProgress: string

  packings: string
  newPacking: string
  packingStatus: string
  packingStoreStatus: string
  packingRemovedStatus: string
  selectPackingStatus: string
  editPacking: string

  showPassiveSeedBatches: string
  seedBatchState: string

  returnToPreviousList: string

  printPacking: string
  print: string
  selectPrinter: string
  update: string

  amountInStore: string
  oldestPackingInStore: string
  store: string

  campaigns: string
  newCampaign: string
  campaignName: string
  productCount: string
  addCampaignProduct: string
}

const strings: IStrings = new LocalizedStrings({
  en: require("./en.json"),
  fi: require("./fi.json")
});

export default strings;
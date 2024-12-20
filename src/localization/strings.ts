import LocalizedStrings, {
  LocalizedStringsMethods
} from 'localized-strings';
import LocalizedUtils from './localizedutils';

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
  selectDate: string;
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
  labelNumberOfBaskets: string
  labelTotalBasketWeight: string
  labelBasketWeights: string
  labelAddBasket: string
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
  labelCuttingHeight: string
  editEventHeader: string
  deleteEventConfirmText: string
  harvestTypeBAGGING: string
  harvestTypeCUTTING: string
  harvestTypeBOXING: string
  potTypeSMALL: string
  potTypeLARGE: string
  potTypePAPER: string
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
  reportTypeItemPACKED_CAMPAINGS: string
  reportTypeItemSUMMARY: string
  reportTypeItemJUVA_PLANTING_LIST_REPORT: string
  reportTypeItemJUVA_HARVEST_LIST_REPORT: string
  reportTypeItemJUVA_PACKING_LIST_REPORT: string
  reportTypeItemJUVA_SOWING_SUMMARY_REPORT: string
  reportTypeItemJUVA_PLANTING_SUMMARY_REPORT: string
  reportTypeItemJUVA_PACKING_SUMMARY_REPORT: string
  reportTypeItemJUVA_HARVEST_SUMMARY_REPORT: string
  reportTypeItemJUVA_YIELD_SUMMARY_REPORT: string
  reportTypeItemJUVA_SOWING_WORK_HOURS_REPORT: string
  reportTypeItemJUVA_PLANTING_WORK_HOURS_REPORT: string
  reportTypeItemJUVA_PACKING_WORK_HOURS_REPORT: string
  reportTypeItemJUVA_HARVEST_WORK_HOURS_REPORT: string
  reportTypeItemJUVA_PLANTING_WORK_HOUR_SUMMARY_REPORT: string
  reportTypeItemJUVA_SOWING_WORK_HOUR_SUMMARY_REPORT: string
  reportTypeItemJUVA_HARVEST_WORK_HOUR_SUMMARY_REPORT: string
  reportTypeItemJUVA_PACKING_WORK_HOUR_SUMMARY_REPORT: string
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
  packingWastageStatus: string
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
  openAll: string
  closeAll: string
  filterByDate: string

  campaigns: string
  newCampaign: string
  campaignName: string
  productCount: string
  addCampaignProduct: string
  editCampaign: string

  packingType: string
  packingTypeBasic: string
  packingTypeCampaign: string
  campaign: string

  subcontractorProduct: string

  cut: string
  weight: string
  gutterCount: string
  gutterHoleCount: string
  contactInformation: string
  producer: string
  sowingDay: string
  cuttingDay: string
  storageCondition: string
  createCutPacking: string
  cutPackings: string

  editCutPacking: string
  events: string
  total: string
  labelSowingDate: string
  allEventTypes: string
  showInActiveProductsLabel: string
  activeProductLabel: string

  packingTableHeaderName: string
  packingTableHeaderDate: string
  packingTableHeaderBoxes: string
  packingTableHeaderStatus: string
  packingTableHeaderPackageSize: string

  allPackingStates: string
  allProductionLines: string

  totalPackingsRow: string

  discards: string;
  newDiscard: string;
  discardDate: string;
  editDiscard: string;
  edit: string;

  allCampaings: string;
  removeFromStorageButton: string;
  allowedHarvestTypes: string;

  dashboard: string
  dashboardFormDescription: string;
  dashboardCount: string;

  isEndProduct: string;
  isRawMaterial: string;
  salesWeight: string;
  verificationWeighingWeight: string;
  verificationWeighingTime: string;
  usedBasketProductName: string;
  usedBasketBasketCount: string;
  verificationWeighings: string;
  basketsUsed: string;
}

const strings: IStrings = new LocalizedStrings({
  en_joroinen: require("./en.json"),
  en_juva: LocalizedUtils.getFacilityOverrides("en", "juva"),
  fi_joroinen: require("./fi.json"),
  fi_juva: LocalizedUtils.getFacilityOverrides("fi", "juva")
}, {
  customLanguageInterface: () => "fi_joroinen"
});

export default strings;
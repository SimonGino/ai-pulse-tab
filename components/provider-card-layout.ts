const ORG_CARD_SECTION_MARGIN_TOP_PX = 12;

export function getOrgCardSectionContainerClassName() {
  return 'flex flex-col';
}

export function getOrgCardSectionContentMarginTop(index: number) {
  return index > 0 ? `${ORG_CARD_SECTION_MARGIN_TOP_PX}px` : 0;
}

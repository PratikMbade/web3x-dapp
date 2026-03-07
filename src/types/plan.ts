export interface Plan {
  id: string;
  name: string;
  displayName: string;
  price: number;
  tier: number;
}

export interface PlanStructureProps {
  planName: string;
  globalCount: number;
  highestPlanetBought: number;
}

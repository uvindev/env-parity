export type Severity = "high" | "medium" | "notice";
export type RuleId =
  | "ENV001"
  | "ENV002"
  | "ENV003"
  | "ENV004"
  | "ENV005"
  | "ENV006";

export interface EnvironmentReference {
  key: string;
  lines: number[];
}

export interface CoverageRow {
  key: string;
  lines: number[];
  used: boolean;
  documented: boolean;
  development: boolean;
  preview: boolean;
  production: boolean;
  public: boolean;
}

export interface Finding {
  rule: RuleId;
  severity: Severity;
  key: string;
  line: number | null;
  title: string;
  detail: string;
  repair: string;
}

export interface ContractReport {
  references: EnvironmentReference[];
  coverage: CoverageRow[];
  findings: Finding[];
  generatedContract: string;
  discardedValueLines: number;
}

/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObject } from "@freelensapp/kube-object";
import { observer } from "mobx-react";
import { Badge } from "../badge";
import { DrawerItem } from "../drawer";
import { getClassName, getTooltip } from "./components";
import { sortConditions } from "./utils";

import type { Condition, KubeObjectMetadata, KubeObjectStatus } from "@freelensapp/kube-object";

export interface KubeObjectConditionsDrawerProps {
  object: KubeObject;
  conditionTypePriorities?: Record<string, number>;
}

export const KubeObjectConditionsDrawer = observer((props: KubeObjectConditionsDrawerProps) => {
  const { object, conditionTypePriorities } = props;

  if (!object) {
    return null;
  }

  if (!(object instanceof KubeObject)) {
    return null;
  }

  const conditions = (object as KubeObject<KubeObjectMetadata, KubeObjectStatus>).status?.conditions;

  if (!conditions?.length) return null;

  return (
    <DrawerItem name="Conditions" className="conditions" hidden={!conditions?.length} labelsOnly>
      <ConditionBadges
        conditions={conditions}
        idPrefix={`drawer-${object.getId()}`}
        conditionTypePriorities={conditionTypePriorities}
      />
    </DrawerItem>
  );
});

export interface ConditionBadgesProps {
  conditions: Condition[];
  /**
   * Makes the ids of the tooltips unique, when more than one list of conditions is on the page.
   */
  idPrefix: string;
  conditionTypePriorities?: Record<string, number>;
}

/**
 * A badge for each condition, with its details in a tooltip.
 */
export const ConditionBadges = observer(({ conditions, idPrefix, conditionTypePriorities }: ConditionBadgesProps) => (
  <>
    {sortConditions(conditions, conditionTypePriorities)?.map((condition) => (
      <Badge
        key={condition.type}
        label={condition.type}
        disabled={condition.status === "False"}
        tooltip={getTooltip(condition, `${idPrefix}-condition-${condition.type}`)}
        tooltipFormatters={{ tableView: true }}
        className={getClassName(condition)}
      />
    ))}
  </>
));

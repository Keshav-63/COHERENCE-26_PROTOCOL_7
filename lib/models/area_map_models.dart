class AreaInsight {
  const AreaInsight({
    required this.id,
    required this.areaName,
    required this.district,
    required this.latitude,
    required this.longitude,
    required this.completionRate,
    required this.totalProjects,
    required this.completedProjects,
    required this.utilizationRate,
    required this.allocatedBudgetCr,
    required this.spentBudgetCr,
    required this.riskLevel,
    required this.financialAdvancements,
    required this.workDone,
    required this.pendingWork,
    required this.descriptiveAnalysis,
  });

  final String id;
  final String areaName;
  final String district;
  final double latitude;
  final double longitude;
  final double completionRate;
  final int totalProjects;
  final int completedProjects;
  final double utilizationRate;
  final double allocatedBudgetCr;
  final double spentBudgetCr;
  final String riskLevel;
  final List<String> financialAdvancements;
  final List<String> workDone;
  final List<String> pendingWork;
  final String descriptiveAnalysis;
}

class AreaMapSeedData {
  static const areas = <AreaInsight>[
    AreaInsight(
      id: 'vasai-west-coastal',
      areaName: 'Vasai West Coastal Belt',
      district: 'Palghar',
      latitude: 19.3802,
      longitude: 72.8204,
      completionRate: 0.84,
      totalProjects: 15,
      completedProjects: 12,
      utilizationRate: 0.88,
      allocatedBudgetCr: 142.0,
      spentBudgetCr: 125.0,
      riskLevel: 'Low',
      financialAdvancements: [
        'Rs 36 Cr released for stormwater line expansion near coastal wards',
        'Rs 18 Cr milestone payment cleared for ward road resurfacing',
        'Rs 9 Cr sanctioned for public sanitation upgrade near market zones',
      ],
      workDone: [
        'Primary stormwater channels deepened and relined',
        'Road resurfacing completed on major connecting roads',
        'Public sanitation blocks upgraded in high-footfall pockets',
      ],
      pendingWork: [
        'Foreshore walkway lighting package pending final utility approval',
        'Footpath extension near station link road in execution',
      ],
      descriptiveAnalysis:
          'This belt has strong fund utilization with visible completion in drainage and roads. Remaining delays are mainly utility-clearance related. Closing pending approvals can push completion above 90 percent in the coming cycle.',
    ),
    AreaInsight(
      id: 'vasai-east-industrial',
      areaName: 'Vasai East Industrial Stretch',
      district: 'Palghar',
      latitude: 19.3993,
      longitude: 72.8757,
      completionRate: 0.66,
      totalProjects: 18,
      completedProjects: 12,
      utilizationRate: 0.71,
      allocatedBudgetCr: 168.0,
      spentBudgetCr: 119.0,
      riskLevel: 'Medium',
      financialAdvancements: [
        'Rs 41 Cr disbursed for industrial approach road and drain rehabilitation',
        'Rs 19 Cr paid against water pipeline strengthening package',
        'Rs 12 Cr approved for worker mobility and bus-bay infra',
      ],
      workDone: [
        'Internal industrial approach roads improved in 4 clusters',
        'Drain rehabilitation completed in flood-prone pockets',
      ],
      pendingWork: [
        'Pipeline strengthening phase-2 running behind schedule',
        'Mobility package pending depot-side integration clearance',
      ],
      descriptiveAnalysis:
          'Budget drawdown is moderate with good progress on road and drainage fronts. Water and mobility packages are facing sequencing delays. Milestone-driven monitoring can reduce spillover risk.',
    ),
    AreaInsight(
      id: 'naigaon-civic-core',
      areaName: 'Naigaon Civic Core',
      district: 'Palghar',
      latitude: 19.3518,
      longitude: 72.8462,
      completionRate: 0.74,
      totalProjects: 13,
      completedProjects: 10,
      utilizationRate: 0.79,
      allocatedBudgetCr: 102.0,
      spentBudgetCr: 81.0,
      riskLevel: 'Low',
      financialAdvancements: [
        'Rs 24 Cr spent on local sewer interception and pumping upgrades',
        'Rs 11 Cr deployed for civic toilet modernization near transit points',
        'Rs 8 Cr retained for monsoon runoff diversion package',
      ],
      workDone: [
        'Sewer interception lines completed in dense residential strips',
        'Transit-adjacent sanitation upgrades completed',
      ],
      pendingWork: ['Runoff diversion package pending design sign-off'],
      descriptiveAnalysis:
          'Area performance is healthy with visible sanitation outcomes. Pending work is design-centric rather than funding-related, and completion quality remains above district average.',
    ),
    AreaInsight(
      id: 'nalasopara-east-growth',
      areaName: 'Nalasopara East Growth Zone',
      district: 'Palghar',
      latitude: 19.4245,
      longitude: 72.8617,
      completionRate: 0.58,
      totalProjects: 20,
      completedProjects: 12,
      utilizationRate: 0.63,
      allocatedBudgetCr: 176.0,
      spentBudgetCr: 111.0,
      riskLevel: 'High',
      financialAdvancements: [
        'Rs 33 Cr consumed for junction improvements and LED streetlight rollout',
        'Rs 27 Cr parked for carriageway widening pending utility shifting',
        'Rs 14 Cr held due to tender challenge in outfall drain package',
      ],
      workDone: [
        'LED retrofit completed in key intersections',
        'Approach road strengthening completed in 2 segments',
      ],
      pendingWork: [
        'Carriageway widening package below planned progress',
        'Drain outfall diversion package in tender dispute',
        'Cluster sanitation package awaiting release order',
      ],
      descriptiveAnalysis:
          'This zone carries the highest execution risk in the Vasai cluster. Delays are tied to utility shifting and contractor sequencing. Targeted package-level escalation is required to avoid quarter-end backlog.',
    ),
    AreaInsight(
      id: 'virar-west-transit',
      areaName: 'Virar West Transit Ring',
      district: 'Palghar',
      latitude: 19.4550,
      longitude: 72.8138,
      completionRate: 0.71,
      totalProjects: 14,
      completedProjects: 10,
      utilizationRate: 0.76,
      allocatedBudgetCr: 118.0,
      spentBudgetCr: 90.0,
      riskLevel: 'Medium',
      financialAdvancements: [
        'Rs 22 Cr allocated for multimodal access roads near station ring',
        'Rs 15 Cr released for utility safety and cable ducting prep',
        'Rs 9 Cr committed for bus node decongestion redesign',
      ],
      workDone: [
        'Pedestrian access improvements completed near transit core',
        'Drain desilting and relining completed in selected corridors',
      ],
      pendingWork: [
        'Cable ducting package awaiting utility NOC',
        'Bus node redesign at DPR finalization stage',
      ],
      descriptiveAnalysis:
          'Execution quality is acceptable with steady spending. Inter-agency sequencing is still weak in utility-linked packages, reducing visible mobility outcomes in the short term.',
    ),
    AreaInsight(
      id: 'sopara-rural-fringe',
      areaName: 'Sopara Rural Fringe',
      district: 'Palghar',
      latitude: 19.3320,
      longitude: 72.8680,
      completionRate: 0.51,
      totalProjects: 16,
      completedProjects: 8,
      utilizationRate: 0.56,
      allocatedBudgetCr: 148.0,
      spentBudgetCr: 83.0,
      riskLevel: 'High',
      financialAdvancements: [
        'Rs 19 Cr used for anganwadi and school roof safety repairs',
        'Rs 25 Cr earmarked for village tank desilting and borewell rehab',
        'Rs 20 Cr approved for last-mile road connectivity package',
      ],
      workDone: ['Anganwadi roof repairs completed in 6 villages'],
      pendingWork: [
        'Village tank desilting pending at multiple sites',
        'Last-mile road package mobilization delayed',
        'Mobile health outreach unit pending manpower allocation',
      ],
      descriptiveAnalysis:
          'This fringe cluster needs immediate governance focus. Fund use and physical progress remain below plan, especially in water and mobility works. Priority interventions should target monsoon resilience and road access first.',
    ),
  ];
}

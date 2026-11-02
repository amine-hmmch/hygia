export interface EtapeAes {
  numero: number;
  titre: string;
  delai: string;
  actions: string[];
  interdictions?: string[];
  details?: string;
  type: 'immediat' | 'medical' | 'administratif' | 'suivi' | 'analyse';
}

export const URGENCE_AES_DATA = {
  titre: 'Conduite à tenir en cas d’Accident d’Exposition au Sang (AES)',
  reference: 'Guide du Professionnel – Sécurité Sanitaire des ESSP (Section 1.10 & Annexe 3)',
  prerequis: [
    'Procédure devant être affichée ou consultable dans toutes les zones de soins et de stérilisation.',
    'Matériel nécessaire aux soins immédiats immédiatement accessible.',
    'Coordonnées du médecin référent AES le plus proche disponibles (Urgences hospitalières ou Maladies Infectieuses).',
  ],
  etapes: [
    {
      numero: 1,
      titre: 'Soins immédiats sur piqûre ou coupure cutanée',
      delai: 'Immédiatement (Minute 0 à 5)',
      type: 'immediat' as const,
      actions: [
        'Laver immédiatement à l’eau et au savon pour éliminer toute trace de sang.',
        'Réaliser une asepsie à l’aide de solution chlorée (solution de Dakin commercialisée, Eau de Javel à 2,6% fraîchement diluée au 1/5ème) ou à défaut avec un dérivé iodé ou de l’alcool à 70°.',
        'Respecter dans tous les cas un TEMPS DE CONTACT D’AU MOINS 5 MINUTES.',
      ],
      interdictions: [
        'NE PAS FAIRE SAIGNER LA PLAIE (ne pas presser ni comprimer).',
      ],
      details: 'La désinfection doit durer au moins 5 minutes montre en main pour assurer une action virucide efficace.',
    },
    {
      numero: 2,
      titre: 'Soins immédiats sur projection muqueuse ou conjonctive',
      delai: 'Immédiatement (Minute 0 à 5)',
      type: 'immediat' as const,
      actions: [
        'En cas de projection de sang ou de liquide biologique souillé de sang sur les muqueuses et en particulier la conjonctive :',
        'Laver abondamment à l’eau ou de préférence au SÉRUM PHYSIOLOGIQUE pendant au moins 5 MINUTES.',
      ],
      interdictions: [
        'Ne jamais appliquer d’alcool, d’eau de javel ou de Dakin dans l’œil ou sur les muqueuses.',
      ],
      details: 'Rinçage continu à l’eau propre ou sérum physiologique 0,9%.',
    },
    {
      numero: 3,
      titre: 'Consultation médicale urgente aux urgences hospitalières',
      delai: 'Dans les plus brefs délais (< 4 heures)',
      type: 'medical' as const,
      actions: [
        'Contacter dans les plus brefs délais le médecin au niveau des urgences de l’hôpital (ou service des Maladies Infectieuses).',
        'Le médecin évaluera le risque infectieux encouru.',
        'Il indiquera ou non la mise en route d’une prophylaxie de l’infection à VIH (chimioprophylaxie anti-rétrovirale d’urgence).',
      ],
      details: 'Si un traitement prophylactique anti-VIH est requis, il doit débuter idéalement dans les 4 heures suivant l’accident (au plus tard dans les 48 heures).',
    },
    {
      numero: 4,
      titre: 'Déclaration administrative d’accident du travail',
      delai: 'Dans les 24h à 48h réglementaires',
      type: 'administratif' as const,
      actions: [
        'Déclarer l’accident du travail auprès de l’administration de l’ESSP / Direction de l’hôpital.',
        'Consigner les circonstances précises : date, heure, geste pratiqué, matériel en cause, statut du patient source si connu.',
      ],
      details: 'Permet la prise en charge médico-légale et la couverture intégrale des soins et bilans.',
    },
    {
      numero: 5,
      titre: 'Suivi sérologique et clinique réglementaire',
      delai: 'Avant J8, puis à J90 et J180',
      type: 'suivi' as const,
      actions: [
        'Sérologie VIH obligatoire : avant J8, à J90 (3 mois) et à J180 (6 mois).',
        'Contrôle des Anticorps anti-HBs pour vérifier la présence d’anticorps vaccinaux protecteurs (Hépatite B).',
        'Le cas échéant, suivi VHB ou VHC en fonction du statut du patient source pris en charge.',
      ],
      details: 'Le suivi sérologique régulier confirme l’absence de séroconversion.',
    },
    {
      numero: 6,
      titre: 'Analyse des causes de l’accident',
      delai: 'Post-accident / REX d’équipe',
      type: 'analyse' as const,
      actions: [
        'Il est indispensable d’analyser les causes de l’accident pour éviter qu’il ne se reproduise.',
        'Vérifier le respect des consignes : port de gants, absence de recapuchonnage d’aiguille, élimination immédiate dans le conteneur jaune de sécurité.',
      ],
      details: 'Démarche d’amélioration continue et de culture de sécurité au sein du service.',
    },
  ],
};

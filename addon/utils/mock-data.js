/**
 * Mock data commonly used in frontend apps.
 *
 * @author Jakub Liput
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/* eslint-disable max-len */
export const exampleMarkdownShort = `
# Hello world

Test description with **bold**.

## Foo

* Baz
* Bar

## Lorem

* Ipsum
* Dolor
`;

export const exampleMarkdownLong = `/BTau/Run2010B - Apr21ReReco - v1 / AOD, CMS collaboration

Cite as: CMS collaboration (2014). BTau primary dataset in AOD format from RunB of 2010 (/BTau/Run2010B-Apr21ReReco-v1/AOD). CERN Open Data Portal. [DOI:10.7483/OPENDATA.CMS.A342.9982](http://doi.org/10.7483/OPENDATA.CMS.A342.9982)

## Security test

<a href="javascript:alert('You have been hacked');">Href hack</a>

<a onclick="alert('You have been hacked');">On click hack</a>

<script type="text/javascript">
  window.alert('You have been hacked');
</script>

## Description

BTau primary dataset in AOD format from RunB of 2010

This dataset contains all runs from 2010 RunB. The list of validated runs, which must be applied to all analyses, can be found in

[CMS list of validated runs Cert\\_136033 - 149442 \\_7TeV\\_Apr21ReReco\\_Collisions10\\_JSON\\_v2.txt](http://opendata.cern.ch/record/1000)

## Dataset characteristics

**25423849** events. **2916** files. **2.7 TB** in total.

## System details

Recommended [global tag](http://opendata.cern.ch/docs/cms-guide-for-condition-database) for analysis: \`FT_R_42_V10A::All\`
Recommended release for analysis: \`CMSSW_4_2_8\`

## How were these data selected?

Events stored in this primary dataset were selected because of presence of more than one isolated tau in the event, or because of presence of low-energy muons from b-quark decay.

#### Data taking / HLT

The collision data were assigned to different RAW datasets using the following [HLT configuration](http://opendata.cern.ch/record/1699).

##### Data processing / RECO

This primary AOD dataset was processed from the RAW dataset by the following step:
Step: RECO
Release: CMSSW_4_2_1_patch1
Global tag: FT_R_42_V10A::All
The configuration file for RECO step can be generated with [the cmsDriver command line script](http://opendata.cern.ch/docs/cms-guide-event-production#the-cmsdriver-tool) in the corresponding CMSSW release area:
\`cmsDriver.py reco -s RAW2DIGI,L1Reco,RECO --data --conditions FT_R_42_V10A::All --eventcontent AOD --no_exec --python reco_cmsdriver2010.py\`

###### HLT trigger paths

The possible HLT trigger paths in this dataset are:

* HLT\\_BTagIP_Jet50U
* HLT\\_BTagMu_DiJet10U
* HLT\\_BTagMu_DiJet20U
* HTL\\_BTagMu_DiJet20U_Mu5
* HTL\\_BTagMu_DiJet30U
* HTL\\_BTagMu_DiJet30U_Mu5
* HTL\\_BTagMu_Jet10U
* HTL\\_BTagMu_Jet20U
* HTL\\_DoubleIsoTau15_OneLeg_Trk5
* HTL\\_DoubleIsoTau15_Trk5
* HTL\\_DoubleLooseIsoTau15
* HTL\\_SingleIsoTau20_Trk15_MET20
* HTL\\_SingleIsoTau20_Trk15_MET25
* HTL\\_SingleIsoTau20_Trk5
* HTL\\_SingleIsoTau20_Trk5_MET20
* HTL\\_SingleIsoTau30_Trk5
* HTL\\_SingleIsoTau30_Trk5_L120or30
* HTL\\_SingleIsoTau30_Trk5_MET20
* HTL\\_SingleIsoTau35_Trk15_MET25
* HTL\\_SingleLooseIsoTau20
* HTL\\_SingleLooseIsoTau25_Trk5
`;

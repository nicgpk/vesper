import {imageMaterialDemo} from './ImageMaterialStudy';
import {combineStudyFamilies} from './StudyFamilies';
import {generativeChatDemo} from './GenerativeChatStudy';
import './avatar-progress-refinements.css';
import './field-insets.css';
import {toolFeedbackDemos} from './ToolFeedbackStudies';
import './study-shimmer.css';
import {ReviewerLookupRefinement} from './ReviewerLookupRefinement';
import {TableReviewRefinement} from './TableReviewRefinement';
/* SPDX-License-Identifier: MIT
 * The pinned registry remains intact. Six native compositions are refined,
 * and three authored loading studies are added without claiming native coverage.
 */
import {demos as nativeDemos, type Demo} from './demos';
import {EmptyCollectionRefinement,ContextCollectionRefinement} from './LocalCollectionsRefinement';
import {CollectionMenuRefinement} from './CollectionMenuRefinement';
import {ArtBrightnessRefinement} from './ArtBrightnessRefinement';
import {CollectionViewRefinement} from './CollectionViewRefinement';
import {FieldsRefinement} from './FieldsRefinement';
import {loadingDemos} from './LoadingStudies';
import {approvalDemo} from './ApprovalStudy';
import {chatOverrides} from './ChatRefinements';
import {conversationOverrides} from './ConversationRefinements';
import {chatFeedbackOverrides} from './ChatFeedbackRefinements';
const overrides = {'native-typeahead':ReviewerLookupRefinement,'native-table-composition':TableReviewRefinement,...chatOverrides,...conversationOverrides,...chatFeedbackOverrides,'form-field-family':FieldsRefinement,'slider':ArtBrightnessRefinement,'segmented-control':CollectionViewRefinement,'dropdown-menu-family':CollectionMenuRefinement,'empty-collection':EmptyCollectionRefinement,'context-menu':ContextCollectionRefinement};
const refinements: Record<string, Partial<Demo>> = {
 'native-typeahead':{name:'Reviewer lookup',description:'Search a delayed local directory, handle unavailable results and retry without losing the chosen reviewer.',code:"// Included local composition, not a package export.\nimport {ReviewerLookupRefinement} from './ReviewerLookupRefinement';\n<ReviewerLookupRefinement />"},
 'native-table-composition':{name:'Document review',description:'Select documents, update their review status and undo local changes.',code:"// Included local composition, not a package export.\nimport {TableReviewRefinement} from './TableReviewRefinement';\n<TableReviewRefinement />"},
 'empty-collection':{name:'Create a collection',description:'Create a local collection and open its review notes.',code:"// Included local composition, not a package export.\nimport {EmptyCollectionRefinement} from './LocalCollectionsRefinement';\n<EmptyCollectionRefinement />"},
 'context-menu':{name:'Collection actions',description:'Open review notes or create a visible local duplicate.',code:"// Included local composition, not a package export.\nimport {ContextCollectionRefinement} from './LocalCollectionsRefinement';\n<ContextCollectionRefinement />"},
 'dropdown-menu-family':{name:'Collection menu',description:'Sort documents, show dates and organize one local collection.',code:"// Included local composition, not a package export.\nimport {CollectionMenuRefinement} from './CollectionMenuRefinement';\n<CollectionMenuRefinement />"},
 'slider': {name:'Artwork comparison',description:'Compare the original artwork with a brightness adjustment.',material:'A native slider with a direct visual result.',code:"// Included local composition, not a package export.\nimport {ArtBrightnessRefinement} from './ArtBrightnessRefinement';\n<ArtBrightnessRefinement />"},
 'segmented-control': {name:'Collection views',description:'Switch the same documents between grid, list and table.',material:'One collection, three useful presentations.',code:"// Included local composition, not a package export.\nimport {CollectionViewRefinement} from './CollectionViewRefinement';\n<CollectionViewRefinement />"},
 'form-field-family': {name:'Prepare a review',description:'Name the review, ask a clear question and optionally select a supporting document. Preview the local brief before starting over.',material:'Native form controls with a clear outcome. Selected files stay on this page and are not read or uploaded.',code:"// Included local composition, not a package export.\nimport {FieldsRefinement} from './FieldsRefinement';\n<FieldsRefinement />"},
 'chat-reactions': {name:'Message reactions',description:'One local reaction flow with reversible selection and a clean empty state.',code:"// Included local composition, not a package export.\nimport {ReactionsRefinement} from './ChatFeedbackRefinements';\n<ReactionsRefinement />"},
 'chat-dictation': {name:'On-device dictation',description:'Explicit on-device microphone activation with checking, cancellation and truthful end states; typed fallback.',code:"// Included local composition, not a package export.\nimport {DictationRefinement} from './ChatFeedbackRefinements';\n<DictationRefinement />"},
 'chat-conversation': {code: "// Included local composition, not a package export.\nimport {ConversationRefinement} from './ConversationRefinements';\n<ConversationRefinement />", name:'Conversation',description:'A finite local response with typing, shimmer, cancellation and a readable review transcript.'},
 'chat-layout': {code: "// Included local composition, not a package export.\nimport {LayoutRefinement} from './ConversationRefinements';\n<LayoutRefinement />", name:'Conversation',description:'A docked local composer with meaningful message history and real scroll navigation.'},
 'chat-composer': {code: "// Included local composition, not a package export.\nimport {ComposerRefinement} from './ChatRefinements';\n<ComposerRefinement />", name:'Chat composer',description:'Context-aware drafting with native mention insertion and a local message receipt.'},
 'chat-reasoning': {code: "// Included local composition, not a package export.\nimport {ReasoningRefinement} from './ChatRefinements';\n<ReasoningRefinement />", name:'Tool run',description:'Finite local tool steps with cancellation, failure recovery and inspectable results.',material:'Native tool-call rows and source disclosure, with explicit local execution states.'},
};
const ungroupedDemos = [...nativeDemos.map(demo => overrides[demo.id] ? {...demo,...refinements[demo.id],Preview:overrides[demo.id]} : demo), ...loadingDemos, approvalDemo, ...toolFeedbackDemos, generativeChatDemo, imageMaterialDemo];

export const libraryDemos=combineStudyFamilies(ungroupedDemos);

import { useRef, useState } from "react";
import { Checkbox, ChoiceGroup, IChoiceGroupOption, Panel, DefaultButton, Spinner, TextField, SpinButton } from "@fluentui/react";

import styles from "./OneShot.module.css";

import { askApi, Approaches, AskResponse, AskRequest } from "../../api";
import { Answer, AnswerError } from "../../components/Answer";
import { QuestionInput } from "../../components/QuestionInput";
import { ExampleList } from "../../components/Example";
import { AnalysisPanel, AnalysisPanelTabs } from "../../components/AnalysisPanel";
import { SettingsButton } from "../../components/SettingsButton/SettingsButton";

const OneShot = () => {
    const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);
    const [approach, setApproach] = useState<Approaches>(Approaches.RetrieveThenRead);
    const [promptTemplate, setPromptTemplate] = useState<string>("");
    const [promptTemplatePrefix, setPromptTemplatePrefix] = useState<string>("");
    const [promptTemplateSuffix, setPromptTemplateSuffix] = useState<string>("");
    const [retrieveCount, setRetrieveCount] = useState<number>(3);
    const [useSemanticRanker, setUseSemanticRanker] = useState<boolean>(true);
    const [useSemanticCaptions, setUseSemanticCaptions] = useState<boolean>(false);
    const [excludeCategory, setExcludeCategory] = useState<string>("");

    const lastQuestionRef = useRef<string>("");

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<unknown>();
    const [answer, setAnswer] = useState<AskResponse>();

    const [activeCitation, setActiveCitation] = useState<string>();
    const [activeAnalysisPanelTab, setActiveAnalysisPanelTab] = useState<AnalysisPanelTabs | undefined>(undefined);

    const makeApiRequest = async (question: string) => {
        lastQuestionRef.current = question;

        error && setError(undefined);
        setIsLoading(true);
        setActiveCitation(undefined);
        setActiveAnalysisPanelTab(undefined);

        try {
            const request: AskRequest = {
                question,
                approach,
                overrides: {
                    promptTemplate: promptTemplate.length === 0 ? undefined : promptTemplate,
                    promptTemplatePrefix: promptTemplatePrefix.length === 0 ? undefined : promptTemplatePrefix,
                    promptTemplateSuffix: promptTemplateSuffix.length === 0 ? undefined : promptTemplateSuffix,
                    excludeCategory: excludeCategory.length === 0 ? undefined : excludeCategory,
                    top: retrieveCount,
                    semanticRanker: useSemanticRanker,
                    semanticCaptions: useSemanticCaptions
                }
            };
            const result = await askApi(request);
            setAnswer(result);
        } catch (e) {
            setError(e);
        } finally {
            setIsLoading(false);
        }
    };

    const onPromptTemplateChange = (_ev?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setPromptTemplate(newValue || "");
    };

    const onPromptTemplatePrefixChange = (_ev?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setPromptTemplatePrefix(newValue || "");
    };

    const onPromptTemplateSuffixChange = (_ev?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setPromptTemplateSuffix(newValue || "");
    };

    const onRetrieveCountChange = (_ev?: React.SyntheticEvent<HTMLElement, Event>, newValue?: string) => {
        setRetrieveCount(parseInt(newValue || "3"));
    };

    const onApproachChange = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, option?: IChoiceGroupOption) => {
        setApproach((option?.key as Approaches) || Approaches.RetrieveThenRead);
    };

    const onUseSemanticRankerChange = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
        setUseSemanticRanker(!!checked);
    };

    const onUseSemanticCaptionsChange = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
        setUseSemanticCaptions(!!checked);
    };

    const onExcludeCategoryChanged = (_ev?: React.FormEvent, newValue?: string) => {
        setExcludeCategory(newValue || "");
    };

    const onExampleClicked = (example: string) => {
        makeApiRequest(example);
    };

    const onShowCitation = (citation: string) => {
        if (activeCitation === citation && activeAnalysisPanelTab === AnalysisPanelTabs.CitationTab) {
            setActiveAnalysisPanelTab(undefined);
        } else {
            setActiveCitation(citation);
            setActiveAnalysisPanelTab(AnalysisPanelTabs.CitationTab);
        }
    };

    const onToggleTab = (tab: AnalysisPanelTabs) => {
        if (activeAnalysisPanelTab === tab) {
            setActiveAnalysisPanelTab(undefined);
        } else {
            setActiveAnalysisPanelTab(tab);
        }
    };

    const approaches: IChoiceGroupOption[] = [
        {
            key: Approaches.RetrieveThenRead,
            text: "Retrieve-Then-Read"
        },
        {
            key: Approaches.ReadRetrieveRead,
            text: "Read-Retrieve-Read"
        },
        {
            key: Approaches.ReadDecomposeAsk,
            text: "Read-Decompose-Ask"
        }
    ];

    return (
        <div className={styles.oneshotContainer}>
            <div className={styles.oneshotTopSection}>
                <SettingsButton className={styles.settingsButton} onClick={() => setIsConfigPanelOpen(!isConfigPanelOpen)} />
                <h2 className={styles.oneshotTitle}>사전에 학습한 데이터를 기반으로 응답합니다.</h2>
                <div className={styles.oneshotQuestionInput}>
                    <QuestionInput placeholder="여기에 질문을 입력하세요." disabled={isLoading} onSend={question => makeApiRequest(question)} />
                </div>
            </div>
            <div className={styles.oneshotBottomSection}>
                {isLoading && <Spinner label="답변 생성중" />}
                {!lastQuestionRef.current && <ExampleList onExampleClicked={onExampleClicked} />}
                {!isLoading && answer && !error && (
                    <div className={styles.oneshotAnswerContainer}>
                        <Answer
                            answer={answer}
                            onCitationClicked={x => onShowCitation(x)}
                            onThoughtProcessClicked={() => onToggleTab(AnalysisPanelTabs.ThoughtProcessTab)}
                            onSupportingContentClicked={() => onToggleTab(AnalysisPanelTabs.SupportingContentTab)}
                        />
                    </div>
                )}
                {error ? (
                    <div className={styles.oneshotAnswerContainer}>
                        <AnswerError error={error.toString()} onRetry={() => makeApiRequest(lastQuestionRef.current)} />
                    </div>
                ) : null}
                {activeAnalysisPanelTab && answer && (
                    <AnalysisPanel
                        className={styles.oneshotAnalysisPanel}
                        activeCitation={activeCitation}
                        onActiveTabChanged={x => onToggleTab(x)}
                        citationHeight="600px"
                        answer={answer}
                        activeTab={activeAnalysisPanelTab}
                    />
                )}
            </div>

            <Panel
                headerText="답변 생성 설정"
                isOpen={isConfigPanelOpen}
                isBlocking={false}
                onDismiss={() => setIsConfigPanelOpen(false)}
                closeButtonAriaLabel="닫기"
                onRenderFooterContent={() => <DefaultButton onClick={() => setIsConfigPanelOpen(false)}>Close</DefaultButton>}
                isFooterAtBottom={true}
            >
                <ChoiceGroup
                    className={styles.oneshotSettingsSeparator}
                    label="Approach"
                    options={approaches}
                    defaultSelectedKey={approach}
                    onChange={onApproachChange}
                />

                {(approach === Approaches.RetrieveThenRead || approach === Approaches.ReadDecomposeAsk) && (
                    <TextField
                        className={styles.oneshotSettingsSeparator}
                        defaultValue={promptTemplate}
                        label="프롬프트 사전 설정 바꾸기"
                        multiline
                        autoAdjustHeight
                        onChange={onPromptTemplateChange}
                    />
                )}

                {approach === Approaches.ReadRetrieveRead && (
                    <>
                        <TextField
                            className={styles.oneshotSettingsSeparator}
                            defaultValue={promptTemplatePrefix}
                            label="Override prompt prefix template"
                            multiline
                            autoAdjustHeight
                            onChange={onPromptTemplatePrefixChange}
                        />
                        <TextField
                            className={styles.oneshotSettingsSeparator}
                            defaultValue={promptTemplateSuffix}
                            label="Override prompt suffix template"
                            multiline
                            autoAdjustHeight
                            onChange={onPromptTemplateSuffixChange}
                        />
                    </>
                )}

                <SpinButton
                    className={styles.oneshotSettingsSeparator}
                    label="동시에 검색할 문서의 수(페이지):"
                    min={1}
                    max={50}
                    defaultValue={retrieveCount.toString()}
                    onChange={onRetrieveCountChange}
                />
                <TextField className={styles.oneshotSettingsSeparator} label="제외할 카테고리" onChange={onExcludeCategoryChanged} />
                <Checkbox
                    className={styles.oneshotSettingsSeparator}
                    checked={useSemanticRanker}
                    label="검색을 위해 semantic ranker 사용"
                    onChange={onUseSemanticRankerChange}
                />
                <Checkbox
                    className={styles.oneshotSettingsSeparator}
                    checked={useSemanticCaptions}
                    label="전체 문서 대신 요약자료에서 검색"
                    onChange={onUseSemanticCaptionsChange}
                    disabled={!useSemanticRanker}
                />
            </Panel>
        </div>
    );
};

export default OneShot;

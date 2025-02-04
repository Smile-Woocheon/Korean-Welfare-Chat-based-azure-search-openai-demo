import { useRef, useState, useEffect } from "react";
import {
  Checkbox,
  Panel,
  DefaultButton,
  TextField,
  SpinButton,
} from "@fluentui/react";
import { SparkleFilled } from "@fluentui/react-icons";

import styles from "./Chat.module.css";

import {
  chatApi,
  Approaches,
  AskResponse,
  ChatRequest,
  ChatTurn,
} from "../../api";
import { Answer, AnswerError, AnswerLoading } from "../../components/Answer";
import { QuestionInput } from "../../components/QuestionInput";
import { ExampleList } from "../../components/Example";
import { UserChatMessage } from "../../components/UserChatMessage";
import {
  AnalysisPanel,
  AnalysisPanelTabs,
} from "../../components/AnalysisPanel";
import { SettingsButton } from "../../components/SettingsButton";
import { ClearChatButton } from "../../components/ClearChatButton";

const Chat = () => {
  const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);
  const [promptTemplate, setPromptTemplate] = useState<string>("");
  const [retrieveCount, setRetrieveCount] = useState<number>(3);
  const [useSemanticRanker, setUseSemanticRanker] = useState<boolean>(true);
  const [useSemanticCaptions, setUseSemanticCaptions] =
    useState<boolean>(false);
  const [excludeCategory, setExcludeCategory] = useState<string>("");
  const [useSuggestFollowupQuestions, setUseSuggestFollowupQuestions] =
    useState<boolean>(false);

  const lastQuestionRef = useRef<string>("");
  const chatMessageStreamEnd = useRef<HTMLDivElement | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown>();

  const [activeCitation, setActiveCitation] = useState<string>();
  const [activeAnalysisPanelTab, setActiveAnalysisPanelTab] = useState<
    AnalysisPanelTabs | undefined
  >(undefined);

  const [selectedAnswer, setSelectedAnswer] = useState<number>(0);
  const [answers, setAnswers] = useState<
    [user: string, response: AskResponse][]
  >([]);

  const makeApiRequest = async (question: string) => {
    lastQuestionRef.current = question;

    error && setError(undefined);
    setIsLoading(true);
    setActiveCitation(undefined);
    setActiveAnalysisPanelTab(undefined);

    try {
      const history: ChatTurn[] = answers.map((a) => ({
        user: a[0],
        bot: a[1].answer,
      }));
      const request: ChatRequest = {
        history: [...history, { user: question, bot: undefined }],
        approach: Approaches.ReadRetrieveRead,
        overrides: {
          promptTemplate:
            promptTemplate.length === 0 ? undefined : promptTemplate,
          excludeCategory:
            excludeCategory.length === 0 ? undefined : excludeCategory,
          top: retrieveCount,
          semanticRanker: useSemanticRanker,
          semanticCaptions: useSemanticCaptions,
          suggestFollowupQuestions: useSuggestFollowupQuestions,
        },
      };
      const result = await chatApi(request);
      setAnswers([...answers, [question, result]]);
    } catch (e) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    lastQuestionRef.current = "";
    error && setError(undefined);
    setActiveCitation(undefined);
    setActiveAnalysisPanelTab(undefined);
    setAnswers([]);
  };

  useEffect(
    () => chatMessageStreamEnd.current?.scrollIntoView({ behavior: "smooth" }),
    [isLoading]
  );

  const onPromptTemplateChange = (
    _ev?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string
  ) => {
    setPromptTemplate(newValue || "");
  };

  const onRetrieveCountChange = (
    _ev?: React.SyntheticEvent<HTMLElement, Event>,
    newValue?: string
  ) => {
    setRetrieveCount(parseInt(newValue || "3"));
  };

  const onUseSemanticRankerChange = (
    _ev?: React.FormEvent<HTMLElement | HTMLInputElement>,
    checked?: boolean
  ) => {
    setUseSemanticRanker(!!checked);
  };

  const onUseSemanticCaptionsChange = (
    _ev?: React.FormEvent<HTMLElement | HTMLInputElement>,
    checked?: boolean
  ) => {
    setUseSemanticCaptions(!!checked);
  };

  const onExcludeCategoryChanged = (
    _ev?: React.FormEvent,
    newValue?: string
  ) => {
    setExcludeCategory(newValue || "");
  };

  const onUseSuggestFollowupQuestionsChange = (
    _ev?: React.FormEvent<HTMLElement | HTMLInputElement>,
    checked?: boolean
  ) => {
    setUseSuggestFollowupQuestions(!!checked);
  };

  const onExampleClicked = (example: string) => {
    makeApiRequest(example);
  };

  const onShowCitation = (citation: string, index: number) => {
    if (
      activeCitation === citation &&
      activeAnalysisPanelTab === AnalysisPanelTabs.CitationTab &&
      selectedAnswer === index
    ) {
      setActiveAnalysisPanelTab(undefined);
    } else {
      setActiveCitation(citation);
      setActiveAnalysisPanelTab(AnalysisPanelTabs.CitationTab);
    }

    setSelectedAnswer(index);
  };

  const onToggleTab = (tab: AnalysisPanelTabs, index: number) => {
    if (activeAnalysisPanelTab === tab && selectedAnswer === index) {
      setActiveAnalysisPanelTab(undefined);
    } else {
      setActiveAnalysisPanelTab(tab);
    }

    setSelectedAnswer(index);
  };

  return (
    <div className={styles.container}>
      <div className={styles.commandsContainer}>
        <ClearChatButton
          className={styles.commandButton}
          onClick={clearChat}
          disabled={!lastQuestionRef.current || isLoading}
        />
        <SettingsButton
          className={styles.commandButton}
          onClick={() => setIsConfigPanelOpen(!isConfigPanelOpen)}
        />
      </div>
      <div className={styles.chatRoot}>
        <div className={styles.chatContainer}>
          {!lastQuestionRef.current ? (
            <div className={styles.chatEmptyState}>
              <SparkleFilled
                fontSize={"120px"}
                primaryFill={"rgba(115, 118, 225, 1)"}
                aria-hidden="true"
                aria-label="Chat logo"
              />
              <h1 className={styles.chatEmptyStateTitle}>
                사회복지 데이터 ChatGPT
              </h1>
              <h2 className={styles.chatEmptyStateSubtitle}>
                사전에 학습한 매뉴얼, 사례집 등을 기반으로 대답합니다.
              </h2>
              <h3 className={styles.chatEmptyStateSubtitle}>
                본 사이트는 alpha 버전으로 불안정하며, 대답이 정확하지 않을 수
                있습니다.
              </h3>
              <h3 className={styles.chatEmptyStateSubtitle}>
                <a href="https://www.welfareai.net/chat" target="_blank">
                  상세 안내 클릭
                </a>
              </h3>

              <ExampleList onExampleClicked={onExampleClicked} />
            </div>
          ) : (
            <div className={styles.chatMessageStream}>
              {answers.map((answer, index) => (
                <div key={index}>
                  <UserChatMessage message={answer[0]} />
                  <div className={styles.chatMessageGpt}>
                    <Answer
                      key={index}
                      answer={answer[1]}
                      isSelected={
                        selectedAnswer === index &&
                        activeAnalysisPanelTab !== undefined
                      }
                      onCitationClicked={(c) => onShowCitation(c, index)}
                      onThoughtProcessClicked={() =>
                        onToggleTab(AnalysisPanelTabs.ThoughtProcessTab, index)
                      }
                      onSupportingContentClicked={() =>
                        onToggleTab(
                          AnalysisPanelTabs.SupportingContentTab,
                          index
                        )
                      }
                      onFollowupQuestionClicked={(q) => makeApiRequest(q)}
                      showFollowupQuestions={
                        useSuggestFollowupQuestions &&
                        answers.length - 1 === index
                      }
                    />
                  </div>
                </div>
              ))}
              {isLoading && (
                <>
                  <UserChatMessage message={lastQuestionRef.current} />
                  <div className={styles.chatMessageGptMinWidth}>
                    <AnswerLoading />
                  </div>
                </>
              )}
              {error ? (
                <>
                  <UserChatMessage message={lastQuestionRef.current} />
                  <div className={styles.chatMessageGptMinWidth}>
                    <AnswerError
                      error={error.toString()}
                      onRetry={() => makeApiRequest(lastQuestionRef.current)}
                    />
                  </div>
                </>
              ) : null}
              <div ref={chatMessageStreamEnd} />
            </div>
          )}

          <div className={styles.chatInput}>
            <QuestionInput
              clearOnSend
              placeholder="새로운 질문을 입력하세요."
              disabled={isLoading}
              onSend={(question) => makeApiRequest(question)}
            />
          </div>
        </div>

        {answers.length > 0 && activeAnalysisPanelTab && (
          <AnalysisPanel
            className={styles.chatAnalysisPanel}
            activeCitation={activeCitation}
            onActiveTabChanged={(x) => onToggleTab(x, selectedAnswer)}
            citationHeight="810px"
            answer={answers[selectedAnswer][1]}
            activeTab={activeAnalysisPanelTab}
          />
        )}

        <Panel
          headerText="답변 생성 설정"
          isOpen={isConfigPanelOpen}
          isBlocking={false}
          onDismiss={() => setIsConfigPanelOpen(false)}
          closeButtonAriaLabel="닫기"
          onRenderFooterContent={() => (
            <DefaultButton onClick={() => setIsConfigPanelOpen(false)}>
              Close
            </DefaultButton>
          )}
          isFooterAtBottom={true}
        >
          <TextField
            className={styles.chatSettingsSeparator}
            defaultValue={promptTemplate}
            label="프롬프트 사전 설정 바꾸기"
            multiline
            autoAdjustHeight
            onChange={onPromptTemplateChange}
          />

          <SpinButton
            className={styles.chatSettingsSeparator}
            label="동시에 검색할 문서의 수(페이지):"
            min={1}
            max={50}
            defaultValue={retrieveCount.toString()}
            onChange={onRetrieveCountChange}
          />
          <TextField
            className={styles.chatSettingsSeparator}
            label="제외할 카테고리"
            onChange={onExcludeCategoryChanged}
          />
          <Checkbox
            className={styles.chatSettingsSeparator}
            checked={useSemanticRanker}
            label="검색을 위해 semantic ranker 사용"
            onChange={onUseSemanticRankerChange}
          />
          <Checkbox
            className={styles.chatSettingsSeparator}
            checked={useSemanticCaptions}
            label="전체 문서 대신 요약자료에서 검색"
            onChange={onUseSemanticCaptionsChange}
            disabled={!useSemanticRanker}
          />
          <Checkbox
            className={styles.chatSettingsSeparator}
            checked={useSuggestFollowupQuestions}
            label="후속 질문 받기"
            onChange={onUseSuggestFollowupQuestionsChange}
          />
        </Panel>
      </div>
    </div>
  );
};

export default Chat;

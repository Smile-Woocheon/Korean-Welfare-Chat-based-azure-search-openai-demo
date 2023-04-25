import { Example } from "./Example";

import styles from "./Example.module.css";

export type ExampleModel = {
    text: string;
    value: string;
};

const EXAMPLES: ExampleModel[] = [
    {
        text: "북한이탈주민의 남한생활 만족도는 연령별로 어떻게 되나요? 표로 만들어서 정리하고 결론을 요약해주세요.",
        value: "북한이탈주민의 남한생활 만족도는 연령별로 어떻게 되나요? 표로 만들어서 정리하고 결론을 요약해주세요."
    },
    {
        text: "대한민국 청년을 위한 복지정책에 대해 설명하고, 신청 방법을 알려주세요.",
        value: "대한민국 청년을 위한 복지정책에 대해 설명하고, 신청 방법을 알려주세요."
    },
    {
        text: "영구임대주택단지의 역사를 설명하고, 앞으로 개선이 필요한 점을 요약해주세요.",
        value: "영구임대주택단지의 역사를 설명하고, 앞으로 개선이 필요한 점을 요약해주세요."
    }
];

interface Props {
    onExampleClicked: (value: string) => void;
}

export const ExampleList = ({ onExampleClicked }: Props) => {
    return (
        <ul className={styles.examplesNavList}>
            {EXAMPLES.map((x, i) => (
                <li key={i}>
                    <Example text={x.text} value={x.value} onClick={onExampleClicked} />
                </li>
            ))}
        </ul>
    );
};

import { Outlet, NavLink, Link } from "react-router-dom";

import github from "../../assets/github.svg";

import styles from "./Layout.module.css";

const Layout = () => {
    return (
        <div className={styles.layout}>
            <header className={styles.header} role={"banner"}>
                <div className={styles.headerContainer}>
                    <Link to="/" className={styles.headerTitleContainer}>
                        <h3 className={styles.headerTitle}>사회복지 데이터 ChatGPT</h3>
                    </Link>
                    <nav>
                        <ul className={styles.headerNavList}>
                            {/* 상단 중앙 메뉴, 챗페이지 주석처리
                            <li>
                                <NavLink to="/" className={({ isActive }) => (isActive ? styles.headerNavPageLinkActive : styles.headerNavPageLink)}>
                                    Chat
                                </NavLink>
                            </li>
                            <li className={styles.headerNavLeftMargin}>
                                <NavLink to="/qa" className={({ isActive }) => (isActive ? styles.headerNavPageLinkActive : styles.headerNavPageLink)}>
                                    Ask a question
                                </NavLink>
                            </li>
                            <li className={styles.headerNavLeftMargin}>
                                <a
                                    href="https://github.com/Smile-Woocheon/Korean-Welfare-Chat-based-azure-search-openai-demo"
                                    target={"_blank"}
                                    title="Github repository link"
                                >
                                    <img
                                        src={github}
                                        alt="Github logo"
                                        aria-label="Link to github repository"
                                        width="20px"
                                        height="20px"
                                        className={styles.githubLogo}
                                    />
                                </a>
                            </li>
                            */}
                        </ul>
                    </nav>
                    <h3 className={styles.headerRightText}>
                        <a href="https://www.welfareai.net/chat" target={"_blank"} title="about">
                            <img src="/qicon.png" aria-label="Link to about" width="25px" height="25px" />
                        </a>
                    </h3>
                </div>
            </header>

            <Outlet />
        </div>
    );
};

export default Layout;

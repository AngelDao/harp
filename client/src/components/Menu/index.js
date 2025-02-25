import React, { useEffect, useState } from "react";
import { MenuContainer, Item, EffectContainer, ItemContainer } from "./styles";
import { StyledLink } from "./styles";
import { withRouter } from "react-router-dom";
import { pathFinder } from "../../utils/ipfsRouteHelper";
import UseRedirectToHttps from "../../hooks/https";

const Menu = ({ location, history }) => {
  UseRedirectToHttps();
  const [current, setCurrent] = useState(location.pathname.split("/")[1]);
  const [currentH, setCurrentH] = useState(null);

  const handleClick = (c) => {
    setCurrent(c);
  };

  const handleHover = (c) => {
    // setCurrentH(c);
  };

  const pushToHistory = (route) => {
    history.push(route);
  };

  useEffect(() => {
    setCurrent(location.pathname.split("/")[1]);
  }, [location.pathname]);

  return (
    <MenuContainer>
      <EffectContainer>
        <ItemContainer>
          <div onClick={() => pushToHistory("stake")}>
            <Item
              onMouseLeave={() => handleHover("")}
              onMouseOver={() => handleHover("stake")}
              onClick={() => handleClick("stake")}
              current={current === "stake"}
              hover={currentH === "stake"}
            >
              Stake
            </Item>
          </div>
          <div onClick={() => pushToHistory("farm")}>
            <Item
              onMouseLeave={() => handleHover("")}
              onMouseOver={() => handleHover("farm")}
              onClick={() => handleClick("farm")}
              current={current === "farm"}
              hover={currentH === "farm"}
            >
              Farm
            </Item>
          </div>
          <div onClick={() => pushToHistory("borrow")}>
            <Item
              onMouseLeave={() => handleHover("")}
              onMouseOver={() => handleHover("borrow")}
              onClick={() => handleClick("borrow")}
              current={current === "borrow"}
              hover={currentH === "borrow"}
            >
              Borrow
            </Item>
          </div>
          <div onClick={() => pushToHistory("repay")}>
            <Item
              onMouseLeave={() => handleHover("")}
              onMouseOver={() => handleHover("repay")}
              onClick={() => handleClick("repay")}
              current={current === "repay"}
              hover={currentH === "repay"}
            >
              Repay
            </Item>
          </div>
          <div onClick={() => pushToHistory("faq")}>
            <Item
              onMouseLeave={() => handleHover("")}
              onMouseOver={() => handleHover("faq")}
              onClick={() => handleClick("faq")}
              current={current === "faq"}
              hover={currentH === "faq"}
            >
              FAQ
            </Item>
          </div>
        </ItemContainer>
      </EffectContainer>
    </MenuContainer>
  );
};

export default withRouter(Menu);

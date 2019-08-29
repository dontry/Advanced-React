import styled from "styled-components";
import Reset from "../components/Reset";

const Columns = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-gap: 20px;
`;

const ResetPage = props => (
  <Columns>
    <Reset resetToken={props.query.resetToken} />
  </Columns>
);

export default ResetPage;

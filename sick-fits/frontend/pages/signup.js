import moduleName from "module";

const Columns = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-gap: 20px;
`;

const SingupPage = props => <Columns />;

export default SignupPage;

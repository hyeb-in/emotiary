const FirstBox = ({ layout }) => {
  return (
    <section className={`${layout}`}>
      <div>프로젝트 설명</div>
      <div>
        <div>이모지1</div>
        <div>이모지2</div>
        <div>이모지3</div>
      </div>
    </section>
  );
};

export default FirstBox;
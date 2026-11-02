export default function StudentSummary({ name, enrollment, totalHours }) {
  return (
    <section className="student-heading">
      <div>
        <p className="eyebrow">Student record</p>
        <h2>{name || enrollment}</h2>
        <p>{enrollment}</p>
      </div>
      <div className="total">
        <span>Total hours</span>
        <strong>{totalHours}</strong>
      </div>
    </section>
  );
}

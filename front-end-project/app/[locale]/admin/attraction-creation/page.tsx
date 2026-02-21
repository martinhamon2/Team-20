import AttractionCreationForm from "@components/attractions/AttractionCreationForm";

type DataResult = {
  error: string | null;
};

export default function AttractionCreation() {
  return (
    <main>
      <div>
        <h1 className="pageTitle">Admin Attraction Creation</h1>
        <AttractionCreationForm />
      </div>
    </main>
  );
}

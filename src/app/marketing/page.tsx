import { Footer } from "@/components/home-page/footer";
import { Navbar } from "@/components/home-page/navbar";
import DocumentsPage from "@/components/marketing-page/marketing-docs";
import PDFDocumentsGrid from "@/components/marketing-page/pdf-document-grid";




export default function MarketingPage() {
    return (
        <div>
            <Navbar />
            <DocumentsPage />
            <Footer />
        </div>
    );
}

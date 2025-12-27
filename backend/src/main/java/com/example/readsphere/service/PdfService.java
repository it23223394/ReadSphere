package com.example.readsphere.service;

import com.example.readsphere.model.Book;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class PdfService {

    public byte[] generateBooksPdf(List<Book> books, String title) {
        try {
            Document document = new Document();
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter.getInstance(document, baos);
            document.open();

            // Title
            Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20);
            Paragraph pTitle = new Paragraph(title, fontTitle);
            pTitle.setAlignment(Element.ALIGN_CENTER);
            document.add(pTitle);
            document.add(Chunk.NEWLINE);

            // Book list
            Font fontBook = FontFactory.getFont(FontFactory.HELVETICA, 14);
            Font fontBookBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);

            int count = 1;
            for (Book book : books) {
                Paragraph p = new Paragraph();
                p.add(new Chunk(count + ". ", fontBookBold));
                p.add(new Chunk(book.getTitle() + " by " + book.getAuthor(), fontBook));
                
                if (book.getGenre() != null) {
                    p.add(new Chunk(" (" + book.getGenre() + ")", FontFactory.getFont(FontFactory.HELVETICA, 12, Font.ITALIC)));
                }
                
                document.add(p);
                document.add(Chunk.NEWLINE);
                count++;
            }

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}

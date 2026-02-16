'use server';
/**
 * @fileOverview PDFファイルからタスク情報を抽出するためのGenkitフロー。
 *
 * - extractTaskFromPdf - PDFデータを受け取り、構造化されたタスク情報を返す関数。
 * - ExtractTaskFromPdfInput - 入力スキーマ。
 * - ExtractTaskFromPdfOutput - 出力スキーマ。
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExtractTaskFromPdfInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "解析するPDFのデータURI。'data:application/pdf;base64,<encoded_data>' 形式。"
    ),
});
export type ExtractTaskFromPdfInput = z.infer<typeof ExtractTaskFromPdfInputSchema>;

const ExtractTaskFromPdfOutputSchema = z.object({
  title: z.string().describe('タスクのタイトル'),
  description: z.string().describe('タスクの詳細な説明'),
  receptionDate: z.string().nullable().describe('タスクの受付日 (YYYY-MM-DD)'),
  dueDate: z.string().nullable().describe('タスクの期日 (YYYY-MM-DD)'),
});
export type ExtractTaskFromPdfOutput = z.infer<typeof ExtractTaskFromPdfOutputSchema>;

export async function extractTaskFromPdf(
  input: ExtractTaskFromPdfInput
): Promise<ExtractTaskFromPdfOutput> {
  return extractTaskFromPdfFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractTaskFromPdfPrompt',
  input: { schema: ExtractTaskFromPdfInputSchema },
  output: { schema: ExtractTaskFromPdfOutputSchema },
  prompt: `提供されたPDFドキュメントを解析し、以下のタスク情報を抽出してください。
もし日付が見つからない場合は、nullを返してください。日付の形式は必ず YYYY-MM-DD にしてください。

PDFデータ: {{media url=pdfDataUri}}`,
});

const extractTaskFromPdfFlow = ai.defineFlow(
  {
    name: 'extractTaskFromPdfFlow',
    inputSchema: ExtractTaskFromPdfInputSchema,
    outputSchema: ExtractTaskFromPdfOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('PDFの解析に失敗しました。');
    }
    return output;
  }
);

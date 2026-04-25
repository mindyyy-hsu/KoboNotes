import express from 'express';
import cors from 'cors';
import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.post('/api/notion/create-database', async (req, res) => {
  try {
    const { apiKey, parentPageId, mode } = req.body;

    if (!apiKey || !parentPageId) {
      return res.status(400).json({ error: '缺少必要參數' });
    }

    const notion = new Client({ auth: apiKey });

    let properties, title;

    if (mode === 'combined') {
      title = 'Kobo 閱讀筆記';
      properties = {
        '書名': { title: {} },
        '作者': { rich_text: {} },
        '出版社': { rich_text: {} },
        '閱讀進度': { number: { format: 'percent' } },
        '畫線數': { number: {} },
        '筆記數': { number: {} },
        '閱讀狀態': {
          select: {
            options: [
              { name: '已完成', color: 'green' },
              { name: '閱讀中', color: 'yellow' },
              { name: '未開始', color: 'gray' },
            ],
          },
        },
        '新增日期': { date: {} },
      };
    } else if (mode === 'booklist') {
      title = 'Kobo 書籍列表';
      properties = {
        '書名': { title: {} },
        '作者': { rich_text: {} },
        '出版社': { rich_text: {} },
        '閱讀進度': { number: { format: 'percent' } },
        '畫線數': { number: {} },
        '筆記數': { number: {} },
        '閱讀狀態': {
          select: {
            options: [
              { name: '已完成', color: 'green' },
              { name: '閱讀中', color: 'yellow' },
              { name: '未開始', color: 'gray' },
            ],
          },
        },
        '購買狀態': {
          select: {
            options: [
              { name: '已購買', color: 'blue' },
              { name: '樣本', color: 'orange' },
              { name: '推薦', color: 'purple' },
            ],
          },
        },
        '新增日期': { date: {} },
      };
    } else {
      title = 'Kobo 閱讀筆記';
      properties = {
        '書名': { title: {} },
        '作者': { rich_text: {} },
        '出版社': { rich_text: {} },
        '畫線數': { number: {} },
        '筆記數': { number: {} },
        '閱讀日期': { date: {} },
        '狀態': {
          select: {
            options: [
              { name: '已讀', color: 'green' },
              { name: '閱讀中', color: 'yellow' },
              { name: '待讀', color: 'gray' },
            ],
          },
        },
      };
    }

    const response = await notion.databases.create({
      parent: { type: 'page_id', page_id: parentPageId },
      title: [{ type: 'text', text: { content: title } }],
      properties,
    });

    res.json({ databaseId: response.id });
  } catch (error) {
    console.error('Error creating database:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/notion/create-page', async (req, res) => {
  try {
    const { apiKey, databaseId, properties, children } = req.body;

    if (!apiKey || !databaseId || !properties) {
      return res.status(400).json({ error: '缺少必要參數' });
    }

    const notion = new Client({ auth: apiKey });

    const pageData = {
      parent: { database_id: databaseId },
      properties,
    };

    if (children && children.length > 0) {
      pageData.children = children;
    }

    console.log('Creating page with data:', JSON.stringify(pageData, null, 2));

    const response = await notion.pages.create(pageData);
    res.json({ pageId: response.id });
  } catch (error) {
    console.error('Error creating page:', error);
    console.error('Error details:', error.body || error.message);
    res.status(500).json({
      error: error.message,
      details: error.body || 'No additional details'
    });
  }
});

// 更新頁面屬性
app.post('/api/notion/update-page', async (req, res) => {
  try {
    const { apiKey, pageId, properties } = req.body;

    if (!apiKey || !pageId || !properties) {
      return res.status(400).json({ error: '缺少必要參數' });
    }

    const notion = new Client({ auth: apiKey });

    const response = await notion.pages.update({
      page_id: pageId,
      properties,
    });

    res.json({ pageId: response.id });
  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).json({
      error: error.message,
      details: error.body || 'No additional details'
    });
  }
});

// 取得頁面區塊
app.post('/api/notion/get-blocks', async (req, res) => {
  try {
    const { apiKey, pageId } = req.body;

    if (!apiKey || !pageId) {
      return res.status(400).json({ error: '缺少必要參數' });
    }

    const notion = new Client({ auth: apiKey });

    const response = await notion.blocks.children.list({
      block_id: pageId,
    });

    res.json(response.results);
  } catch (error) {
    console.error('Error getting blocks:', error);
    res.status(500).json({
      error: error.message,
      details: error.body || 'No additional details'
    });
  }
});

// 附加區塊到頁面
app.post('/api/notion/append-blocks', async (req, res) => {
  try {
    const { apiKey, pageId, children } = req.body;

    if (!apiKey || !pageId || !children) {
      return res.status(400).json({ error: '缺少必要參數' });
    }

    const notion = new Client({ auth: apiKey });

    const response = await notion.blocks.children.append({
      block_id: pageId,
      children,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error appending blocks:', error);
    res.status(500).json({
      error: error.message,
      details: error.body || 'No additional details'
    });
  }
});

// 刪除區塊
app.post('/api/notion/delete-block', async (req, res) => {
  try {
    const { apiKey, blockId } = req.body;

    if (!apiKey || !blockId) {
      return res.status(400).json({ error: '缺少必要參數' });
    }

    const notion = new Client({ auth: apiKey });

    await notion.blocks.delete({
      block_id: blockId,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting block:', error);
    res.status(500).json({
      error: error.message,
      details: error.body || 'No additional details'
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Notion API Proxy Server running on http://localhost:${PORT}`);
});

from vector_graph_rag import VectorGraphRAG
from vector_graph_rag.config import Settings
import time


def main() -> None:
    # 关闭 LLM 缓存，避免命中缓存后一整段一次性返回
    settings = Settings(use_llm_cache=False)
    rag = VectorGraphRAG(settings=settings)

    # 如需导入文档/文本，请先取消下面示例注释：
    # from vector_graph_rag.loaders import DocumentImporter
    # importer = DocumentImporter(chunk_size=1000, chunk_overlap=200)
    # result = importer.import_sources([
    #     "D:\\project\\Milvus\\vector-graph-rag\\pdf\\demo.pdf",
    # ])
    # rag.add_documents(result.documents, extract_triplets=True)
    # rag.add_texts([
    #     "二甲双胍是2型糖尿病的一线用药。",
    #     "服用二甲双胍的患者应定期监测肾功能。",
    # ])

    question = "电子会计账簿如何组卷？"
    print(f"问题：{question}\n")
    print("回答（流式）：", end="", flush=True)
    char_delay = 0.015  # 打字机速度（秒），可按需调小/调大

    # 直接消费 query_stream 的事件流
    for event in rag.query_stream(question, use_reranking=True):
        event_type = event.get("type")
        if event_type == "answer_chunk":
            delta = event.get("delta", "")
            # 按字符输出，确保肉眼可见“打字机”效果
            for ch in delta:
                print(ch, end="", flush=True)
                time.sleep(char_delay)
        elif event_type == "status":
            stage = event.get("stage")
            if stage in {"retrieving", "reranking", "generating_answer"}:
                print(f"\n[{stage}]...", flush=True)
                if stage == "generating_answer":
                    print("回答（流式）：", end="", flush=True)
        elif event_type == "done":
            print("\n\n--- 完成 ---")
            print(f"实体: {event.get('query_entities', [])}")
            print(f"段落数: {len(event.get('retrieved_passages', []))}")


if __name__ == "__main__":
    main()

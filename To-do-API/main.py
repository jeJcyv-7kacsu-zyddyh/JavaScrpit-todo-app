from fastapi import FastAPI,Depends,HTTPException,Body
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from database import SessionLocal,engine
from typing import List
import models,schemas,crud


models.Base.metadata.create_all(bind=engine)
app=FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.on_event("startup")
async def startup_event():
    print("後端啟動成功！")

@app.get("/todos",response_model=List[schemas.TodoOut])
def read_todos(db:Session=Depends(get_db)):
    return crud.get_todos(db)

@app.get("/todos/{todo_id}",response_model=schemas.TodoOut)
def read_todo(todo_id:int,db:Session=Depends(get_db)):
    todo=crud.get_todo(db,todo_id)
    if not todo:
        raise HTTPException(status_code=404,detail="Todo not found")
    return todo

@app.post("/todos",response_model=schemas.TodoOut)
def create_todo(todo:schemas.TodoCreate,db:Session=Depends(get_db)):
    return crud.create_todo(db,todo)

@app.put("/todos/{todo_id}",response_model=schemas.TodoOut)
def update_todo(todo_id:int,todo:schemas.TodoUpdate,db:Session=Depends(get_db)):
    updated=crud.update_todo(db,todo_id,todo)
    if not updated:
        raise HTTPException(status_code=404,detail="Todo not found")
    return updated

@app.delete("/todos/{todo_id}")
def delete_todo(todo_id:int,db:Session=Depends(get_db)):
    deleted=crud.delete_todo(db,todo_id)
    if not deleted:
        raise HTTPException(status_code=404,detail="Todo not found")
    return {"message":"Todo deleted successfully"}

@app.patch("/todos/{todo_id}",response_model=schemas.TodoOut)
def patch_todo(todo_id:int,todo:dict=Body(...),db:Session=Depends(get_db)):
    db_todo=crud.get_todo(db,todo_id)
    if not db_todo:
        raise HTTPException(status_code=404,detail="Todo not found")
    for key,value in todo.items():
        setattr(db_todo,key,value)
    db.commit()
    db.refresh(db_todo)
    return db_todo
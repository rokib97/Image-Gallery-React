import { Checkbox } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";

import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const [imgs, setImgs] = useState([]);
  console.log(imgs);
  const [loading, setLoading] = useState(true);
  const [hover, setHover] = useState(null);
  const [selected, setSelected] = useState([]);
  const fileRef = useRef(); // Ref for file input

  // Function to handle drag and drop reordering of images
  const onDragEnd = (result) => {
    const { destination } = result;
    if (!destination) return;
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    if (sourceIndex === destinationIndex) return;
    const updatedImgs = [...imgs];
    let temp = updatedImgs[sourceIndex];
    updatedImgs[sourceIndex] = updatedImgs[destinationIndex];
    updatedImgs[destinationIndex] = temp;
    setImgs(updatedImgs);
  };
  // Function to handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const tempImg = URL.createObjectURL(file);
      const updatedImages = [...imgs, { image: tempImg }];
      setImgs(updatedImages);

      toast.success("Image added successfully!", {
        position: "top-center",
        autoClose: 1000,
      });
    }
  };
  // Function to delete selected images
  const handleDelete = (selected, imgs) => {
    const updatedImages = imgs.filter((_, index) => !selected.includes(index));

    setImgs(updatedImages);
    setSelected([]);
    // Notify the user about the image upload
    toast.success(`Deleted ${selected.length} images`, {
      position: "top-center",
      autoClose: 1000,
    });
  };
  // Function to fetch images from a JSON file
  async function fetchImages() {
    try {
      const response = await fetch("./images.json");

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  }
  // Use effect to fetch images when the component mounts
  useEffect(() => {
    const fetchImageData = async () => {
      try {
        const data = await fetchImages();
        setImgs(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchImageData();
  }, []);
  // If data is still loading, show a loading spinner
  if (loading) {
    return (
      <div className="fixed top-0 left-0 h-screen w-screen flex items-center justify-center bg-white opacity-75 z-50">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-t-4 border-green-500 rounded-full"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  return (
    <main className="max-w-7xl mx-auto py-5">
      {selected.length > 0 ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Checkbox isChecked={true} size="lg" colorScheme="green" />
            <h1 className="text-2xl font-bold ml-2">
              {selected.length} Files Selected
            </h1>
          </div>
          <button
            className="bg-red-500 text-white font-bold text-lg py-2 px-4 rounded cursor-pointer hover:bg-red-600"
            onClick={() => handleDelete(selected, imgs)}
          >
            Delete
          </button>
        </div>
      ) : (
        <h1 className="text-2xl font-bold ">Gallery</h1>
      )}

      <hr className="border border-zinc-400 my-4" />
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid-container">
          {imgs.map((img, index) => (
            <Droppable
              isDropDisabled={selected.length > 0}
              key={index}
              droppableId={`drop-image-${index}`}
            >
              {(provided) => (
                <div
                  className="grid-item  rounded-lg overflow-hidden  border-zinc-400 relative"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <Draggable
                    draggableId={`drah-image-${index}`}
                    isDragDisabled={selected.length > 0}
                    shouldRespectForcePress
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <>
                        <div
                          className="absolute inset-0 border transition-transform transform filter brightness-100 hover:brightness-75 rounded-lg group  border-zinc-400"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          onMouseEnter={() => setHover(index)}
                          onMouseLeave={() => setHover(null)}
                        >
                          <img
                            alt=""
                            draggable="false"
                            src={img.image}
                            className={`w-full select-none transition-transform transform group-hover:scale-[1.14] ${
                              selected.includes(index) &&
                              "brightness-90 blur-[1px] scale-[1.25]"
                            } duration-300 filter brightness-100 hover:brightness-75 z-[1]  h-full rounded-lg object-cover border  border-zinc-400`}
                          />

                          <Checkbox
                            isChecked={selected.includes(index)}
                            colorScheme="green"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelected((p) => [...p, index]);
                              } else {
                                setSelected((p) =>
                                  p.filter((i) => i !== index)
                                );
                              }
                            }}
                            size={"lg"}
                            border={"cyan"}
                            hidden={
                              (hover !== index && !selected.includes(index)) ||
                              snapshot.isDragging
                            }
                            className="absolute  top-[-84%] z-[2000] -left-[32%]"
                          ></Checkbox>
                        </div>
                      </>
                    )}
                  </Draggable>

                  {index === 0 ? (
                    <div className="h-[430px] border rounded-lg  border-zinc-400"></div>
                  ) : (
                    <div className="grid-item border rounded-lg  border-zinc-400"></div>
                  )}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
          <div
            onClick={() => fileRef.current.click()}
            className="grid-item rounded-lg border cursor-pointer border-zinc-400 border-dashed bg-gray-100 flex justify-center items-center gap-5 flex-col"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-image"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
            <p className="text-xl font-semibold">Add Images</p>
            <input
              onChange={handleFileChange}
              type="file"
              className="w-0 h-0"
              ref={fileRef}
            />
          </div>
        </div>
        <ToastContainer />
      </DragDropContext>
    </main>
  );
};

export default App;

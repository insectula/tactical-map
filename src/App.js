import * as React from 'react';
import { Box, Button, Fab, Modal, Typography } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import GpsNotFixedIcon from '@mui/icons-material/GpsNotFixed';
import Shield from './components/assets/shield.png';
import Swords from './components/assets/swords.png';
import Watch from './components/assets/watch.png';
import tacticalMap from './components/maps/map.png';
import { ArrowSvg } from 'react-simple-arrows';
import {SocketContext, socket} from './components/context/socket';
import mapPress from './components/events/mapPress';
import markerPress from './components/events/markerPress';
//import './App.css';

function useForceUpdate(){
  const [renders, setRenders] = React.useState(0);
  return () => setRenders(renders => renders + 1); // update the state to force render
}

function App(props) {

  const forceUpdate = useForceUpdate();
  const timeout = React.useRef();
  //const [markerPressed, setMarkerPressed] = React.useState(false);
  const [markers, setMarkers] = React.useState({});
  const [localState, setLocalState] = React.useState('none');

  const [info, setInfo] = React.useState(false);


  const handleInfo = () => setInfo(true);
  const handleCloseInfo = () => setInfo(false);

  const handleArrow = (event) => {
    const id = event.target.attributes.value.value
    console.log('handleArrow x', event.pageX, 'y', event.pageY)
    let data = markers;
    const [x, y] = 
      typeof(event.pageX) !== 'undefined' //if click coords presist or touch coords
        ? [~~event.pageX - data[id].x, ~~event.pageY - data[id].y]  
        : [~~event.touches[0].pageX - data[id].x, ~~event.touches[0].pageY - data[id].y]; 
    data[id].arrowEnd = {x, y}
    setMarkers(data);
    (event.pageX % 2 || event.pageY % 2) && forceUpdate();
  }

  const startDrag = (event) => {
    console.log('start Drag')
    const id = event.target.attributes.value.value
    let data = markers;
    data[id].mode = 'drag'
    setMarkers(data);
    setLocalState('drag')
  }
  const handleDrag = (event) => {
    const id = event.target.attributes.value.value
    console.log('handleDrag x', event.pageX, 'y', event.pageY)
    let data = markers;
    const [x, y] = 
      typeof(event.pageX) !== 'undefined' //if click coords presist or touch coords
        ? [~~event.pageX - 45, ~~event.pageY - 25]  
        : [~~event.touches[0].pageX - 45, ~~event.touches[0].pageY - 25]; 
    data[id] = {...markers[id], x, y}
    setMarkers(data);
    (x % 2 || y % 2) && forceUpdate();
  }

  const handleClick = (id, icon) => {
    console.log(`handleClick (Marker ${props.id})`)
    let data = markers;
    data[id].icon = icon;
    data[id].mode = 'static';
    setTimeout(() => 
      setMarkers(data)
    , 10);
    forceUpdate();
    socket.emit('change', markers);   
}

  const actions = [
    {icon: Swords, action: (id) => handleClick(id, Swords)},
    {icon: Shield, action: (id) => handleClick(id, Shield)},
    {icon: Watch, action: (id) => handleClick(id, Watch)}
]

  function MarkerItem (props) {
    return (
      <div 
        style={{
          pointerEvents: 'none',
          overflow: 'visible',
          position: 'absolute',
          top: markers[props.id].y,
          left: markers[props.id].x,
          display: markers[props.id].mode === 'disabled' ? 'none' : 'block',
          zIndex: 10
      }}> 
    <Fab
        value={props.id} 
        state={markers[props.id].mode}
        sx={{
            border: markers[props.id].mode === 'static' && `1px solid ${markers[props.id].color}`,
            background: `url(${markers[props.id].icon})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center center',
            backgroundColor: 'transparent',
            opacity: markers[props.id].mode === 'drag' ? '50%' : '85%',
            position: 'relative',
            color: markers[props.id].color,
            boxShadow: 'none',
            width:'90px',
            height:'90px',
            pointerEvents:'auto',
            zIndex: 99,
            '&:hover': {
                backgroundColor: 'transparent',
                opacity: markers[props.id].mode === 'drag' ? '50%' : '99%',
            },
            '&:active': {
                boxShadow: 'none',
                border: `1px solid ${markers[props.id].color}`,
                backgroundColor: markers[props.id].color,
                opacity:'45%'
            }
        }} disableRipple={markers[props.id].mode === 'adding' ? true : false} 
        {...pressMarkerEvent}
    >
        {markers[props.id].mode === 'adding' 
            && (
                   (markers[props.id].icon === 'GpsNotFixedIcon' && <GpsNotFixedIcon sx={{ fontSize: '55px', fontWeight: 700 }} />)
                || (markers[props.id].icon === 'ClearIcon' && <ClearIcon sx={{ fontSize: '55px', fontWeight: 700 }} />)
            )
        }

        <div
            value={props.id}
            onMouseMove={(event) => {
              markers[props.id].mode === 'arrow' && handleArrow(event);
              markers[props.id].mode === 'drag' && handleDrag(event);
            }}
            style={{
                backgroundColor: markers[props.id].color, // mode ? arrow/drag : any,
                borderRadius: (markers[props.id].mode==='arrow' || markers[props.id].mode==='drag') ? '0' :'100px',
                height:       (markers[props.id].mode==='arrow' || markers[props.id].mode==='drag') ?'100vh':'90px', 
                width:        (markers[props.id].mode==='arrow' || markers[props.id].mode==='drag') ?'100vw':'90px',
                position:     (markers[props.id].mode==='arrow' || markers[props.id].mode==='drag') ?'fixed':'absolute',
                left: 0, 
                top: 0,
                zIndex:100,
                opacity: '6%'
            }}
        >
            
        </div>
    </Fab>
    <ArrowSvg 
            start={{ x: 45, y: 45 }} 
            end={{ x: markers[props.id].arrowEnd.x, y: markers[props.id].arrowEnd.y }} 
            strokeWidth="5" 
            color={markers[props.id].arrowEnd.x === 45 && markers[props.id].arrowEnd.x === 45 ? 'rgba(0,0,0,0)' : markers[props.id].color}
        />
    <div style={{
        display: (markers[props.id].mode === 'adding' || markers[props.id].mode === 'editing') ? 'block' : 'none',
        pointerEvents: 'none',
        position: 'relative',
        top: -200,
        left: 60,
    }}>

        {actions.map((item, index) => (

            <Fab  value={props.id} 
              onClick={() => item.action(props.id)} 
              sx={{
                background: `url(${item.icon})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center center',
                backgroundColor: 'transparent',
                opacity:'85%',
                position: 'relative',
                color: markers[props.id].color,
                boxShadow: 'none',
                width:'90px',
                height:'90px',
                pointerEvents:'auto',
                zIndex: 99,
                '&:hover': {
                    backgroundColor: 'transparent',
                    opacity:'99%',
                },
                '&:active': {
                    boxShadow: 'none',
                    border: `1px solid ${markers[props.id].color}`,
                    backgroundColor: markers[props.id].color,
                    opacity:'100%',
                }
            }}/>
                
        ))}

      </div>
  </div>
  );
}

  const addMarker = (event) => {
    const randomId = () => "_" + Math.random().toString(36).substr(2, 9);
    const id = randomId(); // applying a random id for state.key and Item's props.id, 
                          //                         but do we need em both?
    //applying event coords to x y
    const [x, y] = 
      typeof(event.pageX) !== 'undefined' //if click coords presist or touch coords
        ? [~~event.pageX - 45, ~~event.pageY - 25]  
        : [~~event.touches[0].pageX - 45, ~~event.touches[0].pageY - 25]; 
    let data = markers;
    data[id] = {
      id, x, y,
      mode: 'adding', 
      color: 'FireBrick',
      icon: 'GpsNotFixedIcon',
      arrowEnd: { x: 45, y: 45 }
    };
    setTimeout(() => 
      setMarkers(data)
    , 5);
    collapseAll(id);
    forceUpdate();
  }

  const editMarker = (id) => {
    let data = markers;
    data[id].mode = 'editing'
    setTimeout(() => 
      setMarkers(data)
    , 5);
    forceUpdate();
  }

  const delMarker = (id) => {
    let data = markers;
    data[id].mode = 'disabled'
    setTimeout(() => 
      setMarkers(data)
    , 5);
    forceUpdate();
  }

  const collapseMarker = (id) => {
    let data = markers;
    data[id].mode = 'static'
    setTimeout(() => 
      setMarkers(data)
    , 5);
    collapseAll(id);
    forceUpdate();
  }

  const collapseAll = (id = 'none') => {
    console.log(`collapseAll ${id}`);
    console.log(markers);
    if (true) {
      console.log('> 0')
      for (const [key, marker] of Object.entries(markers)) {
        if (marker.id !== id) {
          if (marker.mode === 'editing' 
              || marker.mode === 'arrow'
              || marker.mode === 'drag'
              ) {
                console.log(`OK -Collapsed ${key}`);
                collapseMarker(key);
          } else if (marker.mode === 'adding') { 
            console.log(`OK -Removed ${key}`);
              delMarker(key);
          }
        }
      }
    }
  }

  const onMapClick = (e, id = 'none') => {
    console.log(`onMapClick`, e);
    collapseAll(id);
  }

  const onMapPress = (e, id = 'none') => {
    console.log(`onMapPress`, e);
    addMarker(e);
  }

  const onMarkerPress = (event) => {
    const id = event.target.attributes.value.value
    console.log(`onMarkerPress (Marker ${id})`)
    let data = markers;
    if (data[id].mode === 'adding') {
      if (data[id].color === 'FireBrick') {
        data[id].color = 'DarkSlateBlue';
        setMarkers(data);
      } 
      else {data[id].color = 'FireBrick';
      setMarkers(data);
      }
    }
    else if (data[id].mode === 'arrow') {
      data[id].arrowEnd = {x: 45, y: 45}; 
      data[id].mode = 'static';
      setMarkers(data);
    }
    else if (data[id].mode === 'static') { data[id].mode = 'editing'}
    else if (data[id].mode === 'editing') { 
      data[id].mode = 'adding'; 
      data[id].icon = 'ClearIcon';
    }
    collapseAll(id);
    forceUpdate();
    /**timeout = setTimeout((icon=marker.icon) => {
        if (markers[index].mode === 'static') { 
            setMarker({...marker, mode: 'editing', startedPress: false})    
            setTimeout(setMarkers(markers => 
              markers = [...markers, this[index] = {...markers[index], mode: 'editing'}]), 5)
        } else  if (marker.mode === 'editing') { 
            setMarker({...marker, icon: ClearIcon, mode:'adding', startedPress: true, shouldTriggerClick: false});
        }else if (marker.mode === 'adding') {
            if (marker.color === 'FireBrick') {
                setMarker({...marker, color: 'DarkSlateBlue'})
            } else {
                setMarker({...marker, color: 'FireBrick'})
            };
        };
    }, 5);*/
  }
  const onMarkerClick = (event) => {
    const id = event.target.attributes.value.value
    console.log(`onMarkerClick (Marker ${id})`);
    let data = markers;
    collapseAll(id);
    if (data[id].mode === 'adding') { 
      data[id].mode = 'disabled';
      setMarkers(data);
      socket.emit('change', markers);   
    }
    else if (data[id].mode === 'editing' || data[id].mode === 'arrow' || data[id].mode === 'drag') { 
      data[id].mode = 'static';
      setMarkers(data);
      socket.emit('change', markers);   
    }
    else if (data[id].mode === 'static') { 
      data[id].mode = 'arrow';
      setMarkers(data);
    }
    forceUpdate();
    /**setTimeout(() => {
        if (marker.mode === 'static') { 
            setMarker({...marker, mode: 'arrow'});
            props.callback();
        } else if (marker.mode === 'arrow') { 
            e && handleArrow(e);
            setTimeout(() => {
                setMarker({...marker, mode: 'static'})
            }, 1)   
        } else if (marker.mode === 'adding') {
            removeThis()
        } else if (marker.mode === 'editing') {
            props.callback()
        };
    }, 5);*/
  }

  const merge = React.useCallback((change) => {
    setMarkers({...markers, ...change});
  }, []);

  const reset = React.useCallback((change) => {
    setMarkers({});
    forceUpdate();
  }, []);

  const defaultOptions = {
    shouldPreventDefault: true,
    delay: 500,
  }
  const pressMapEvent = new mapPress(defaultOptions, onMapPress, onMapClick)
  const pressMarkerEvent = new markerPress(defaultOptions, onMarkerPress, onMarkerClick, startDrag)

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    pt:4,
    pl: 4,
    pr: 4,
    pb: 8
  };

  const displayMarkers = Object.keys(markers).map((id, _) => (
        <MarkerItem  
          id={markers[id].id}
          key={markers[id].id} 
          alt={markers[id].id}
        />
      )
    );

 
  React.useEffect( () => {
    socket.emit('fetch');
  }, []) 

  React.useEffect( () => {
    socket.on ('change', change => {merge(change)});
    socket.on ('reset', change => {reset(change)});
  }, [socket, merge, reset])

  return (
    <SocketContext.Provider value={socket}>
    <div className="App" style={{
      position: 'absolute',
      backgroundColor: '#bbbb88',
      background: `url(${tacticalMap})`,
      backgroundSize: '2800px 2100px',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center center',
      height: '2100px',
      minWidth: '2800px',
      overflow: 'hidden',
      border: 'none',
      margin: 0,
      padding: 0,
      zIndex: 10
      }}>
      <Button sx={{
        position: 'fixed', 
        left: 0,
        top: 0,
        width:'100%', 
        height:'100%', 
        zIndex: 5,
        '&:hover': {
          backgroundColor: 'rgba(255,255,255,0)'
      }}} disableRipple {...pressMapEvent}/>
      
      {displayMarkers}

      <Modal
        open={info}
        onClose={handleCloseInfo}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h5">
              Управление:
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            <br/>Долгое нажате на карту - Добавить маркер
            <br/>Короткое нажатие - Сброс
            <br/>
            <br/>Долгое нажатие на маркер (при добавлении) - Смена цвета
            <br/>Короткое нажатие - Сброс
            <br/>
            <br/>Долгое нажатие на маркер - Редактировать маркер
            <br/>Короткое нажатие - Нарисовать стрелку
            <br/>
            <br/>Долгое нажатие на маркер (при редактировании) - Удаление/смена цвета
            <br/>
            <br/>Маркеры можно перетаскивать.
            <br/>Маркеры синхронизированы со всеми, кто просматривает страницу.
          </Typography>
        </Box>
      </Modal>

      <Fab 
        onClick={ () => {
                      socket.emit('reset');
                      reset();
        } } 
        sx={{
                      backgroundPosition: 'center center',
                      position: 'fixed',
                      top:15,
                      left:15,
                      width:'50px',
                      height:'50px',
                      color: 'FireBrick',
                      fontSize: 35,
                      justifyContent: 'center',
                      alignItems: 'center',
                      pointerEvents: 'auto',
                      zIndex: 100
                  }}><AutorenewIcon fontSize='md'/></Fab>
      <Fab 
        onClick={handleInfo} 
        sx={{
                      backgroundPosition: 'center center',
                      position: 'fixed',
                      top:80,
                      left:15,
                      width:'50px',
                      height:'50px',
                      color: 'DarkSlateBlue',
                      fontSize: 62  ,
                      justifyContent: 'center',
                      alignItems: 'center',
                      pointerEvents: 'auto',
                      zIndex: 100
                  }}><HelpOutlineIcon fontSize='md'/></Fab>

    </div></SocketContext.Provider>
  );
}

export default App;

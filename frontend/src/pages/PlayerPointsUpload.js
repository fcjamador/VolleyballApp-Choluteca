import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import playerService from '../services/playerService';
import { FaUpload, FaFileExcel, FaInfoCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const PlayerPointsUpload = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const { user } = useSelector((state) => state.auth);

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            toast.warn('Por favor, selecciona un archivo para subir.');
            return;
        }

        setLoading(true);
        try {
            const response = await playerService.uploadPointsFile(selectedFile, user.token);
            toast.success(response.message);
            setSelectedFile(null); // Limpiar el input
            e.target.reset(); // Resetea el formulario para limpiar el nombre del archivo
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al procesar el archivo.';
            const errorDetails = error.response?.data?.errors;

            toast.error(errorMessage);
            if (errorDetails && Array.isArray(errorDetails)) {
                errorDetails.forEach(detail => toast.warn(detail, { autoClose: 8000 }));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="management-container bg-white p-6 rounded-lg shadow-xl max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center">
                <FaUpload className="mr-3 text-blue-600" />
                Cargar Puntos de Jugadores
            </h2>

            {/* Sección de Instrucciones */}
            <div className="mb-6 p-4 border-l-4 border-blue-500 bg-blue-50 rounded-md">
                <div className="flex items-center">
                    <FaInfoCircle className="text-blue-600 mr-3" />
                    <h3 className="text-lg font-semibold text-blue-800">Instrucciones de Formato</h3>
                </div>
                <ul className="list-disc list-inside mt-2 text-sm text-gray-700 space-y-1">
                    <li>El archivo debe ser un formato Excel (`.xlsx`, `.xls`).</li>
                    <li>La primera hoja del archivo será procesada.</li>
                    <li>Debe contener exactamente las siguientes columnas: <strong>ID_Jugador</strong> y <strong>Puntos</strong>.</li>
                    <li>La columna `ID_Jugador` debe corresponder al ID del jugador en el sistema.</li>
                    <li>Los `Puntos` se <strong>sumarán</strong> a los puntos existentes del jugador.</li>
                </ul>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="pointsFile" className="block text-sm font-medium text-gray-700 mb-2">
                        Seleccionar archivo Excel:
                    </label>
                    <div className="mt-1 flex items-center p-2 border-2 border-dashed border-gray-300 rounded-md">
                        <FaFileExcel className="text-green-600 text-2xl mr-3" />
                        <input
                            type="file"
                            id="pointsFile"
                            name="pointsFile"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            accept=".xlsx, .xls"
                        />
                    </div>
                    {selectedFile && <p className="text-sm text-gray-500 mt-2">Archivo seleccionado: {selectedFile.name}</p>}
                </div>

                <div className="flex justify-end space-x-4">
                    <Link to="/players" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md">
                        Cancelar
                    </Link>
                    <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-blue-300">
                        {loading ? 'Procesando...' : 'Subir y Actualizar Puntos'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PlayerPointsUpload;
